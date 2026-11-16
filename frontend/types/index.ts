export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  usn?: string;
  department: string;
  semester?: number;
  phone?: string;
  createdAt?: string;
}

export type AnnouncementCategory =
  | 'Academic'
  | 'Examination'
  | 'Events'
  | 'Placement'
  | 'General';

export type AnnouncementPriority = 'Normal' | 'Important' | 'Urgent';

export interface Announcement {
  _id: string;
  title: string;
  description: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  author?: {
    _id: string;
    name: string;
    role: UserRole;
    department?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type ComplaintCategory =
  | 'Electrical'
  | 'Water'
  | 'Classroom'
  | 'Internet'
  | 'Cleaning'
  | 'Other';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface ComplaintStatusUpdate {
  status: ComplaintStatus;
  remark: string;
  updatedBy?: {
    _id: string;
    name: string;
    role: UserRole;
  };
  updatedAt: string;
}

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  imageUrl?: string;
  status: ComplaintStatus;
  adminRemarks?: string;
  student?: {
    _id: string;
    name: string;
    email: string;
    usn?: string;
    department?: string;
    semester?: number;
  };
  statusHistory: ComplaintStatusUpdate[];
  createdAt: string;
  updatedAt: string;
}

export type EventCategory =
  | 'Technical'
  | 'Cultural'
  | 'Sports'
  | 'Workshop'
  | 'Seminar';

export interface CampusEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: EventCategory;
  capacity: number;
  organizer: string;
  imageUrl?: string;
  registeredCount: number;
  isRegistered: boolean;
  createdAt: string;
}

export interface EventRegistrationItem {
  _id: string;
  registeredAt: string;
  student: {
    _id: string;
    name: string;
    email: string;
    usn?: string;
    department: string;
    semester?: number;
    phone?: string;
  };
}

export type LostFoundType = 'Lost' | 'Found';
export type LostFoundStatus = 'Open' | 'Claimed' | 'Resolved';

export interface LostFoundItem {
  _id: string;
  itemName: string;
  type: LostFoundType;
  description: string;
  location: string;
  date: string;
  contactInfo: string;
  imageUrl?: string;
  status: LostFoundStatus;
  reportedBy?: {
    _id: string;
    name: string;
    email: string;
    usn?: string;
    department?: string;
    role: UserRole;
  };
  createdAt: string;
}

export interface StudentDashboardData {
  stats: {
    totalAnnouncements: number;
    upcomingEventsCount: number;
    myComplaintsTotal: number;
    pendingComplaints: number;
    resolvedComplaints: number;
    registeredEventsCount: number;
    openLostFoundCount: number;
  };
  recentAnnouncements: Announcement[];
  upcomingEvents: CampusEvent[];
  recentComplaints: Complaint[];
}

export interface AdminDashboardData {
  stats: {
    totalStudents: number;
    totalAnnouncements: number;
    totalComplaints: number;
    pendingComplaints: number;
    inProgressComplaints: number;
    resolvedComplaints: number;
    totalUpcomingEvents: number;
    openLostFoundCount: number;
  };
  charts: {
    complaintsByCategory: Array<{
      category: string;
      total: number;
      resolved: number;
      open: number;
    }>;
    complaintsByStatus: Array<{
      name: string;
      value: number;
      color: string;
    }>;
  };
  recentComplaints: Complaint[];
  upcomingEvents: CampusEvent[];
}
