import type { Response, NextFunction } from 'express';
import { User } from '../models/User.ts';
import { Complaint } from '../models/Complaint.ts';
import { EventRegistration } from '../models/EventRegistration.ts';
import type { AuthRequest } from '../middleware/authMiddleware.ts';

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  res.json({ user: req.user });
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, usn, department, semester, phone } = req.body;
    const user = await User.findById(req.user!._id);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (name !== undefined && String(name).trim()) {
      user.name = String(name).trim();
    }
    if (department !== undefined && String(department).trim()) {
      user.department = String(department).trim();
    }
    if (semester !== undefined) {
      user.semester = Number(semester);
    }
    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }
    if (usn !== undefined && user.role === 'STUDENT' && String(usn).trim()) {
      const normalizedUsn = String(usn).trim().toUpperCase();
      if (normalizedUsn !== user.usn) {
        const duplicate = await User.findOne({ usn: normalizedUsn });
        if (duplicate) {
          res.status(400).json({ message: 'This USN is already assigned to another student.' });
          return;
        }
        user.usn = normalizedUsn;
      }
    }

    await user.save();

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        usn: user.usn,
        department: user.department,
        semester: user.semester,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllStudents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, department } = req.query;
    const filter: Record<string, unknown> = { role: 'STUDENT' };

    if (department && department !== 'All') {
      filter.department = String(department);
    }

    if (search && String(search).trim() !== '') {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { usn: regex }];
    }

    const students = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ students });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const student = await User.findOne({ _id: id, role: 'STUDENT' });

    if (!student) {
      res.status(404).json({ message: 'Student record not found.' });
      return;
    }

    await Complaint.deleteMany({ student: student._id });
    await EventRegistration.deleteMany({ student: student._id });
    await student.deleteOne();

    res.json({ message: 'Student account deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
