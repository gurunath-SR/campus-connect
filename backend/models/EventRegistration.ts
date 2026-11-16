import mongoose, { type Document, type Model } from 'mongoose';

export interface IEventRegistration extends Document {
  event: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  registeredAt: Date;
}

const eventRegistrationSchema = new mongoose.Schema<IEventRegistration>(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

eventRegistrationSchema.index({ event: 1, student: 1 }, { unique: true });

export const EventRegistration: Model<IEventRegistration> =
  mongoose.models.EventRegistration ||
  mongoose.model<IEventRegistration>('EventRegistration', eventRegistrationSchema);
