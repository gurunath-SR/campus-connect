import mongoose, { type Document, type Model } from 'mongoose';

export type AnnouncementCategory =
  | 'Academic'
  | 'Examination'
  | 'Events'
  | 'Placement'
  | 'General';

export type AnnouncementPriority = 'Normal' | 'Important' | 'Urgent';

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new mongoose.Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Announcement description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Academic', 'Examination', 'Events', 'Placement', 'General'],
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['Normal', 'Important', 'Urgent'],
      default: 'Normal',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>('Announcement', announcementSchema);
