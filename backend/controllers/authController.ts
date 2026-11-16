import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.ts';
import { generateToken, type AuthRequest } from '../middleware/authMiddleware.ts';

export const registerStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, usn, department, semester, phone } = req.body;

    if (!name || !email || !password || !usn || !department) {
      res.status(400).json({
        message: 'Name, email, password, USN, and department are required.',
      });
      return;
    }

    if (String(password).length < 6) {
      res.status(400).json({
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    const existingEmail = await User.findOne({ email: String(email).toLowerCase() });
    if (existingEmail) {
      res.status(400).json({ message: 'An account with this email already exists.' });
      return;
    }

    const normalizedUsn = String(usn).trim().toUpperCase();
    const existingUsn = await User.findOne({ usn: normalizedUsn });
    if (existingUsn) {
      res.status(400).json({ message: 'An account with this USN is already registered.' });
      return;
    }

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: String(password),
      role: 'STUDENT',
      usn: normalizedUsn,
      department: String(department).trim(),
      semester: Number(semester) || 1,
      phone: phone ? String(phone).trim() : '',
    });

    const token = generateToken(String(user._id), user.role);

    res.status(201).json({
      token,
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

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide both email and password.' });
      return;
    }

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
    }).select('+password');

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(String(password));
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(String(user._id), user.role);

    res.json({
      token,
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

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  res.json({ user: req.user });
};
