import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.ts';
import { protect, authorize } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorize('ADMIN'), createAnnouncement);
router.put('/:id', authorize('ADMIN'), updateAnnouncement);
router.delete('/:id', authorize('ADMIN'), deleteAnnouncement);

export default router;
