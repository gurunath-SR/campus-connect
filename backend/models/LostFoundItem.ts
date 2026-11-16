import mongoose, { type Document, type Model } from 'mongoose';

export type LostFoundType = 'Lost' | 'Found';
export type LostFoundStatus = 'Open' | 'Claimed' | 'Resolved';

export interface ILostFoundItem extends Document {
  itemName: string;
  type: LostFoundType;
  description: string;
  location: string;
  date: Date;
  contactInfo: string;
  imageUrl?: string;
  status: LostFoundStatus;
  reportedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const lostFoundItemSchema = new mongoose.Schema<ILostFoundItem>(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [120, 'Item name cannot exceed 120 characters'],
    },
    type: {
      type: String,
      enum: ['Lost', 'Found'],
      required: [true, 'Report type (Lost or Found) is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    contactInfo: {
      type: String,
      required: [true, 'Contact information is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Open', 'Claimed', 'Resolved'],
      default: 'Open',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const LostFoundItem: Model<ILostFoundItem> =
  mongoose.models.LostFoundItem ||
  mongoose.model<ILostFoundItem>('LostFoundItem', lostFoundItemSchema);
