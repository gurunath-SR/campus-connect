import type { Response, NextFunction } from 'express';
import { Event } from '../models/Event.ts';
import { EventRegistration } from '../models/EventRegistration.ts';
import type { AuthRequest } from '../middleware/authMiddleware.ts';

export const getEvents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, search } = req.query;
    const filter: Record<string, unknown> = {};

    if (category && category !== 'All') {
      filter.category = String(category);
    }

    if (search && String(search).trim() !== '') {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ title: regex }, { description: regex }, { venue: regex }];
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name role')
      .sort({ date: 1 });

    const eventIds = events.map((ev) => ev._id);
    const registrations = await EventRegistration.find({
      event: { $in: eventIds },
    });

    const countMap = new Map<string, number>();
    const userRegisteredSet = new Set<string>();

    for (const reg of registrations) {
      const evKey = String(reg.event);
      countMap.set(evKey, (countMap.get(evKey) || 0) + 1);
      if (req.user && String(reg.student) === String(req.user._id)) {
        userRegisteredSet.add(evKey);
      }
    }

    const enrichedEvents = events.map((ev) => {
      const evKey = String(ev._id);
      return {
        ...ev.toObject(),
        registeredCount: countMap.get(evKey) || 0,
        isRegistered: userRegisteredSet.has(evKey),
      };
    });

    res.json({ events: enrichedEvents });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, date, time, venue, category, capacity, organizer, imageUrl } =
      req.body;

    if (!title || !description || !date || !time || !venue || !capacity) {
      res.status(400).json({
        message: 'Title, description, date, time, venue, and capacity are required.',
      });
      return;
    }

    const resolvedImageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : imageUrl || '';

    const event = await Event.create({
      title: String(title).trim(),
      description: String(description).trim(),
      date: new Date(date),
      time: String(time).trim(),
      venue: String(venue).trim(),
      category: category || 'Technical',
      capacity: Number(capacity),
      organizer: organizer ? String(organizer).trim() : 'Student Council',
      imageUrl: resolvedImageUrl,
      createdBy: req.user!._id,
    });

    res.status(201).json({
      event: {
        ...event.toObject(),
        registeredCount: 0,
        isRegistered: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, date, time, venue, category, capacity, organizer } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ message: 'Event not found.' });
      return;
    }

    if (title !== undefined) event.title = String(title).trim();
    if (description !== undefined) event.description = String(description).trim();
    if (date !== undefined) event.date = new Date(date);
    if (time !== undefined) event.time = String(time).trim();
    if (venue !== undefined) event.venue = String(venue).trim();
    if (category !== undefined) event.category = category;
    if (capacity !== undefined) event.capacity = Number(capacity);
    if (organizer !== undefined) event.organizer = String(organizer).trim();
    if (req.file) event.imageUrl = `/uploads/${req.file.filename}`;

    await event.save();

    const registeredCount = await EventRegistration.countDocuments({ event: event._id });
    res.json({
      event: {
        ...event.toObject(),
        registeredCount,
        isRegistered: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      res.status(404).json({ message: 'Event not found.' });
      return;
    }

    await EventRegistration.deleteMany({ event: event._id });
    res.json({ message: 'Event and associated registrations deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const registerForEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({ message: 'Event not found.' });
      return;
    }

    const existing = await EventRegistration.findOne({
      event: event._id,
      student: req.user!._id,
    });

    if (existing) {
      res.status(400).json({ message: 'You are already registered for this event.' });
      return;
    }

    const currentCount = await EventRegistration.countDocuments({ event: event._id });
    if (currentCount >= event.capacity) {
      res.status(400).json({ message: 'Event registration capacity is full.' });
      return;
    }

    const registration = await EventRegistration.create({
      event: event._id,
      student: req.user!._id,
    });

    res.status(201).json({
      message: 'Successfully registered for the event.',
      registration,
      registeredCount: currentCount + 1,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelEventRegistration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await EventRegistration.findOneAndDelete({
      event: id,
      student: req.user!._id,
    });

    if (!deleted) {
      res.status(404).json({ message: 'Registration not found for this event.' });
      return;
    }

    const currentCount = await EventRegistration.countDocuments({ event: id });
    res.json({
      message: 'Event registration cancelled.',
      registeredCount: currentCount,
    });
  } catch (error) {
    next(error);
  }
};

export const getEventRegistrations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ message: 'Event not found.' });
      return;
    }

    const registrations = await EventRegistration.find({ event: id })
      .populate('student', 'name email usn department semester phone')
      .sort({ registeredAt: -1 });

    res.json({ event, registrations });
  } catch (error) {
    next(error);
  }
};
