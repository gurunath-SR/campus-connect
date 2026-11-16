import type { Response, NextFunction } from 'express';
import { Announcement } from '../models/Announcement.ts';
import type { AuthRequest } from '../middleware/authMiddleware.ts';

export const getAnnouncements = async (
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
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const announcements = await Announcement.find(filter)
      .populate('author', 'name role department')
      .sort({ createdAt: -1 });

    res.json({ announcements });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      res.status(400).json({ message: 'Title and description are required.' });
      return;
    }

    const announcement = await Announcement.create({
      title: String(title).trim(),
      description: String(description).trim(),
      category: category || 'General',
      priority: priority || 'Normal',
      author: req.user!._id,
    });

    const populated = await announcement.populate('author', 'name role department');
    res.status(201).json({ announcement: populated });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, category, priority } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      res.status(404).json({ message: 'Announcement not found.' });
      return;
    }

    if (title !== undefined) announcement.title = String(title).trim();
    if (description !== undefined) announcement.description = String(description).trim();
    if (category !== undefined) announcement.category = category;
    if (priority !== undefined) announcement.priority = priority;

    await announcement.save();
    const populated = await announcement.populate('author', 'name role department');
    res.json({ announcement: populated });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      res.status(404).json({ message: 'Announcement not found.' });
      return;
    }
    res.json({ message: 'Announcement deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
