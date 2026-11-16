import mongoose, { type Document, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'STUDENT' | 'ADMIN';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  usn?: string;
  department: string;
  semester?: number;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['STUDENT', 'ADMIN'],
      default: 'STUDENT',
    },
    usn: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      unique: true,
    },
    department: {
      type: String,
      trim: true,
      default: 'Computer Science & Engineering',
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);
