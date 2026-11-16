import express from 'express';
import {
  getStudentDashboard,
  getAdminDashboard,
} from '../controllers/dashboardController.ts';
import { protect, authorize } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.use(protect);

router.get('/student', authorize('STUDENT'), getStudentDashboard);
router.get('/admin', authorize('ADMIN'), getAdminDashboard);

export default router;
