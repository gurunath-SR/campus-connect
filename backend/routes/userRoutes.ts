import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllStudents,
  deleteStudent,
} from '../controllers/userController.ts';
import { protect, authorize } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/students', authorize('ADMIN'), getAllStudents);
router.delete('/students/:id', authorize('ADMIN'), deleteStudent);

export default router;
