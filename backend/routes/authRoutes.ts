import express from 'express';
import {
  registerStudent,
  loginUser,
  getCurrentUser,
} from '../controllers/authController.ts';
import { protect } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);

export default router;
