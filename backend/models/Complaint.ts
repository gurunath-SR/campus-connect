import mongoose, { type Document, type Model } from 'mongoose';

export type ComplaintCategory =
  | 'Electrical'
  | 'Water'
  | 'Classroom'
  | 'Internet'
  | 'Cleaning'
  | 'Other';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface IComplaintUpdate {
  status: ComplaintStatus;
  remark: string;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

export interface IComplaint extends Document {
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  imageUrl?: string;
  status: ComplaintStatus;
  adminRemarks?: string;
  student: mongoose.Types.ObjectId;
  statusHistory: IComplaintUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new mongoose.Schema<IComplaint>(
  {
    title: {
      type: String,
      required: [true, 'Complaint subject is required'],
      trim: true,
      maxlength: [140, 'Subject cannot exceed 140 characters'],
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Electrical', 'Water', 'Classroom', 'Internet', 'Cleaning', 'Other'],
      required: [true, 'Category is required'],
    },
    location: {
      type: String,
      required: [true, 'Location / Block / Room is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: '',
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['Pending', 'In Progress', 'Resolved'],
          required: true,
        },
        remark: {
          type: String,
          default: '',
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Complaint: Model<IComplaint> =
  mongoose.models.Complaint ||
  mongoose.model<IComplaint>('Complaint', complaintSchema);
