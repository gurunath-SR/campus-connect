import express from 'express';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  getEventRegistrations,
} from '../controllers/eventController.ts';
import { protect, authorize } from '../middleware/authMiddleware.ts';
import { uploadImage } from '../middleware/uploadMiddleware.ts';

const router = express.Router();

router.use(protect);

router.get('/', getEvents);
router.post('/', authorize('ADMIN'), uploadImage.single('image'), createEvent);
router.put('/:id', authorize('ADMIN'), uploadImage.single('image'), updateEvent);
router.delete('/:id', authorize('ADMIN'), deleteEvent);
router.post('/:id/register', authorize('STUDENT'), registerForEvent);
router.delete('/:id/register', authorize('STUDENT'), cancelEventRegistration);
router.get('/:id/registrations', authorize('ADMIN'), getEventRegistrations);

export default router;
