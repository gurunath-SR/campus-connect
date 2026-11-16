import type { Response, NextFunction } from 'express';
import { Complaint, type ComplaintStatus } from '../models/Complaint.ts';
import type { AuthRequest } from '../middleware/authMiddleware.ts';

export const getComplaints = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, category, search } = req.query;
    const filter: Record<string, unknown> = {};

    if (req.user?.role === 'STUDENT') {
      filter.student = req.user._id;
    }

    if (status && status !== 'All') {
      filter.status = String(status);
    }

    if (category && category !== 'All') {
      filter.category = String(category);
    }

    if (search && String(search).trim() !== '') {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ title: regex }, { description: regex }, { location: regex }];
    }

    const complaints = await Complaint.find(filter)
      .populate('student', 'name email usn department semester')
      .populate('statusHistory.updatedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ complaints });
  } catch (error) {
    next(error);
  }
};

export const createComplaint = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, category, location } = req.body;

    if (!title || !description || !category || !location) {
      res.status(400).json({
        message: 'Title, category, location, and description are required.',
      });
      return;
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const complaint = await Complaint.create({
      title: String(title).trim(),
      description: String(description).trim(),
      category,
      location: String(location).trim(),
      imageUrl,
      status: 'Pending',
      student: req.user!._id,
      statusHistory: [
        {
          status: 'Pending',
          remark: 'Complaint submitted by student.',
          updatedBy: req.user!._id,
          updatedAt: new Date(),
        },
      ],
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('student', 'name email usn department semester')
      .populate('statusHistory.updatedBy', 'name role');

    res.status(201).json({ complaint: populated });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body as {
      status?: ComplaintStatus;
      adminRemarks?: string;
    };

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      res.status(404).json({ message: 'Complaint not found.' });
      return;
    }

    const allowedStatuses: ComplaintStatus[] = ['Pending', 'In Progress', 'Resolved'];
    if (status && !allowedStatuses.includes(status)) {
      res.status(400).json({ message: 'Invalid complaint status.' });
      return;
    }

    if (status) {
      complaint.status = status;
    }
    if (adminRemarks !== undefined) {
      complaint.adminRemarks = String(adminRemarks).trim();
    }

    complaint.statusHistory.push({
      status: complaint.status,
      remark:
        (adminRemarks && String(adminRemarks).trim()) ||
        `Status updated to ${complaint.status}.`,
      updatedBy: req.user!._id,
      updatedAt: new Date(),
    });

    await complaint.save();

    const populated = await Complaint.findById(complaint._id)
      .populate('student', 'name email usn department semester')
      .populate('statusHistory.updatedBy', 'name role');

    res.json({ complaint: populated });
  } catch (error) {
    next(error);
  }
};

export const deleteComplaint = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      res.status(404).json({ message: 'Complaint not found.' });
      return;
    }

    const isOwner = String(complaint.student) === String(req.user!._id);
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isAdmin && !isOwner) {
      res.status(403).json({ message: 'Not authorized to delete this complaint.' });
      return;
    }

    if (!isAdmin && complaint.status !== 'Pending') {
      res.status(400).json({
        message: 'Only pending complaints can be withdrawn by students.',
      });
      return;
    }

    await complaint.deleteOne();
    res.json({ message: 'Complaint deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
