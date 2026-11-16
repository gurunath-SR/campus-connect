import type { Response, NextFunction } from 'express';
import { LostFoundItem } from '../models/LostFoundItem.ts';
import type { AuthRequest } from '../middleware/authMiddleware.ts';

export const getLostFoundItems = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, status, search } = req.query;
    const filter: Record<string, unknown> = {};

    if (type && type !== 'All') {
      filter.type = String(type);
    }

    if (status && status !== 'All') {
      filter.status = String(status);
    }

    if (search && String(search).trim() !== '') {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [
        { itemName: regex },
        { description: regex },
        { location: regex },
      ];
    }

    const items = await LostFoundItem.find(filter)
      .populate('reportedBy', 'name email usn department role')
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (error) {
    next(error);
  }
};

export const createLostFoundItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { itemName, type, description, location, date, contactInfo } = req.body;

    if (!itemName || !type || !description || !location || !date || !contactInfo) {
      res.status(400).json({
        message:
          'Item name, report type, description, location, date, and contact information are required.',
      });
      return;
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const item = await LostFoundItem.create({
      itemName: String(itemName).trim(),
      type,
      description: String(description).trim(),
      location: String(location).trim(),
      date: new Date(date),
      contactInfo: String(contactInfo).trim(),
      imageUrl,
      status: 'Open',
      reportedBy: req.user!._id,
    });

    const populated = await item.populate(
      'reportedBy',
      'name email usn department role'
    );
    res.status(201).json({ item: populated });
  } catch (error) {
    next(error);
  }
};

export const updateLostFoundItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, itemName, description, location, contactInfo } = req.body;

    const item = await LostFoundItem.findById(id);
    if (!item) {
      res.status(404).json({ message: 'Reported item not found.' });
      return;
    }

    const isOwner = String(item.reportedBy) === String(req.user!._id);
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isAdmin && !isOwner) {
      res.status(403).json({ message: 'Not authorized to update this item.' });
      return;
    }

    if (status !== undefined) item.status = status;
    if (itemName !== undefined) item.itemName = String(itemName).trim();
    if (description !== undefined) item.description = String(description).trim();
    if (location !== undefined) item.location = String(location).trim();
    if (contactInfo !== undefined) item.contactInfo = String(contactInfo).trim();

    await item.save();
    const populated = await item.populate(
      'reportedBy',
      'name email usn department role'
    );
    res.json({ item: populated });
  } catch (error) {
    next(error);
  }
};

export const deleteLostFoundItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await LostFoundItem.findById(id);

    if (!item) {
      res.status(404).json({ message: 'Reported item not found.' });
      return;
    }

    const isOwner = String(item.reportedBy) === String(req.user!._id);
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isAdmin && !isOwner) {
      res.status(403).json({ message: 'Not authorized to delete this item.' });
      return;
    }

    await item.deleteOne();
    res.json({ message: 'Lost & Found item removed successfully.' });
  } catch (error) {
    next(error);
  }
};
