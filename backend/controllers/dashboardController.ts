import type { Response, NextFunction } from 'express';
import { User } from '../models/User.ts';
import { Announcement } from '../models/Announcement.ts';
import { Complaint } from '../models/Complaint.ts';
import { Event } from '../models/Event.ts';
import { EventRegistration } from '../models/EventRegistration.ts';
import { LostFoundItem } from '../models/LostFoundItem.ts';
import type { AuthRequest } from '../middleware/authMiddleware.ts';

export const getStudentDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const studentId = req.user!._id;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const [
      totalAnnouncements,
      upcomingEvents,
      myComplaints,
      recentAnnouncements,
      myRegistrations,
      openLostFoundCount,
    ] = await Promise.all([
      Announcement.countDocuments(),
      Event.find({ date: { $gte: now } }).sort({ date: 1 }).limit(4),
      Complaint.find({ student: studentId }).sort({ createdAt: -1 }),
      Announcement.find()
        .populate('author', 'name role')
        .sort({ createdAt: -1 })
        .limit(4),
      EventRegistration.find({ student: studentId }),
      LostFoundItem.countDocuments({ status: 'Open' }),
    ]);

    const registeredEventIds = new Set(
      myRegistrations.map((r) => String(r.event))
    );

    const upcomingEventIds = upcomingEvents.map((e) => e._id);
    const eventRegCounts = await EventRegistration.aggregate([
      { $match: { event: { $in: upcomingEventIds } } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>();
    for (const row of eventRegCounts) {
      countMap.set(String(row._id), row.count);
    }

    const pendingCount = myComplaints.filter((c) => c.status === 'Pending').length;
    const inProgressCount = myComplaints.filter(
      (c) => c.status === 'In Progress'
    ).length;
    const resolvedCount = myComplaints.filter((c) => c.status === 'Resolved').length;

    res.json({
      stats: {
        totalAnnouncements,
        upcomingEventsCount: await Event.countDocuments({ date: { $gte: now } }),
        myComplaintsTotal: myComplaints.length,
        pendingComplaints: pendingCount + inProgressCount,
        resolvedComplaints: resolvedCount,
        registeredEventsCount: myRegistrations.length,
        openLostFoundCount,
      },
      recentAnnouncements,
      upcomingEvents: upcomingEvents.map((ev) => ({
        ...ev.toObject(),
        registeredCount: countMap.get(String(ev._id)) || 0,
        isRegistered: registeredEventIds.has(String(ev._id)),
      })),
      recentComplaints: myComplaints.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      totalAnnouncements,
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      totalUpcomingEvents,
      openLostFoundCount,
      categoryBreakdown,
      recentComplaints,
      upcomingEvents,
    ] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      Announcement.countDocuments(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Event.countDocuments({ date: { $gte: now } }),
      LostFoundItem.countDocuments({ status: 'Open' }),
      Complaint.aggregate([
        {
          $group: {
            _id: '$category',
            total: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $ne: ['$status', 'Resolved'] }, 1, 0] },
            },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Complaint.find()
        .populate('student', 'name usn department')
        .sort({ createdAt: -1 })
        .limit(6),
      Event.find({ date: { $gte: now } }).sort({ date: 1 }).limit(4),
    ]);

    const eventIds = upcomingEvents.map((e) => e._id);
    const eventRegCounts = await EventRegistration.aggregate([
      { $match: { event: { $in: eventIds } } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>();
    for (const row of eventRegCounts) {
      countMap.set(String(row._id), row.count);
    }

    res.json({
      stats: {
        totalStudents,
        totalAnnouncements,
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        totalUpcomingEvents,
        openLostFoundCount,
      },
      charts: {
        complaintsByCategory: categoryBreakdown.map((item) => ({
          category: item._id,
          total: item.total,
          resolved: item.resolved,
          open: item.pending,
        })),
        complaintsByStatus: [
          { name: 'Pending', value: pendingComplaints, color: '#DC2626' },
          { name: 'In Progress', value: inProgressComplaints, color: '#D97706' },
          { name: 'Resolved', value: resolvedComplaints, color: '#16A34A' },
        ],
      },
      recentComplaints,
      upcomingEvents: upcomingEvents.map((ev) => ({
        ...ev.toObject(),
        registeredCount: countMap.get(String(ev._id)) || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};
