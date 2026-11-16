import express from 'express';
import {
  getComplaints,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint,
} from '../controllers/complaintController.ts';
import { protect, authorize } from '../middleware/authMiddleware.ts';
import { uploadImage } from '../middleware/uploadMiddleware.ts';

const router = express.Router();

router.use(protect);

router.get('/', getComplaints);
router.post('/', uploadImage.single('image'), createComplaint);
router.put('/:id/status', authorize('ADMIN'), updateComplaintStatus);
router.delete('/:id', deleteComplaint);

export default router;
