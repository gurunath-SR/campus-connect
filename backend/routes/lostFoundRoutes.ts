import express from 'express';
import {
  getLostFoundItems,
  createLostFoundItem,
  updateLostFoundItem,
  deleteLostFoundItem,
} from '../controllers/lostFoundController.ts';
import { protect } from '../middleware/authMiddleware.ts';
import { uploadImage } from '../middleware/uploadMiddleware.ts';

const router = express.Router();

router.use(protect);

router.get('/', getLostFoundItems);
router.post('/', uploadImage.single('image'), createLostFoundItem);
router.put('/:id', updateLostFoundItem);
router.delete('/:id', deleteLostFoundItem);

export default router;
