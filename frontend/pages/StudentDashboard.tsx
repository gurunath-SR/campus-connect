import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  CalendarDays,
  MessageSquareWarning,
  CheckCircle2,
  ArrowRight,
  Plus,
  PackageSearch,
  MapPin,
} from 'lucide-react';
import { motion } from 'motion/react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { StatusIndicator } from '../components/StatusIndicator';
import type { StudentDashboardData } from '../types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getStudentDashboard();
        setData(res);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load dashboard'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6 text-sm text-red-700">
        {error || 'Failed to load student dashboard data.'}
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Academic Cobalt Welcome Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-2xl"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-blue-100/90 font-mono">
              {user?.usn ? `${user.usn} · ` : ''}
              {user?.department}
              {user?.semester ? ` · Semester ${user.semester}` : ''}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-1.5 text-balance">
              Welcome back, {user?.name}
            </h2>
            <p className="text-sm text-blue-100/90 mt-1.5 max-w-xl leading-relaxed">
              Review recent university notices, track your campus complaints, and manage upcoming event registrations from one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/complaints"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-900 bg-white hover:bg-blue-50 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Complaint</span>
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Explore Events</span>
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 transition-all duration-150 hover:border-blue-200 hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Total Announcements
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-700">
              <Megaphone className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
            {data.stats.totalAnnouncements}
          </p>
          <Link
            to="/announcements"
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
          >
            <span>View circulars</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 transition-all duration-150 hover:border-blue-200 hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Upcoming Events
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-700">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
            {data.stats.upcomingEventsCount}
          </p>
          <p className="mt-2.5 text-xs text-slate-500 tabular-nums">
            {data.stats.registeredEventsCount} registered by you
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 transition-all duration-150 hover:border-amber-200 hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Active Complaints
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 border border-amber-100 text-amber-700">
              <MessageSquareWarning className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
            {data.stats.pendingComplaints}
          </p>
          <p className="mt-2.5 text-xs text-slate-500 tabular-nums">
            Out of {data.stats.myComplaintsTotal} submitted
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 transition-all duration-150 hover:border-emerald-200 hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Resolved Issues
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
            {data.stats.resolvedComplaints}
          </p>
          <Link
            to="/lost-found"
            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-700"
          >
            <PackageSearch className="w-3.5 h-3.5" />
            <span>{data.stats.openLostFoundCount} open Lost & Found</span>
          </Link>
        </div>
      </section>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <section className="rounded-xl border border-slate-200/90 bg-white flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                Recent Campus Announcements
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest notices from campus administration
              </p>
            </div>
            <Link
              to="/announcements"
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline whitespace-nowrap"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {data.recentAnnouncements.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No announcements published yet.
              </p>
            ) : (
              data.recentAnnouncements.map((item) => (
                <div
                  key={item._id}
                  className="px-6 py-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      <span className="font-medium text-blue-700">
                        {item.category}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span className="tabular-nums">
                        {formatDate(item.createdAt)}
                      </span>
                    </span>
                    {item.priority !== 'Normal' && (
                      <StatusIndicator status={item.priority} />
                    )}
                  </div>
                  <h4 className="mt-1.5 text-sm font-semibold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* My Complaints Tracker */}
        <section className="rounded-xl border border-slate-200/90 bg-white flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                My Complaint Statuses
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live resolution updates from maintenance teams
              </p>
            </div>
            <Link
              to="/complaints"
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline whitespace-nowrap"
            >
              Manage complaints
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {data.recentComplaints.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-500">
                  You have not submitted any complaints yet.
                </p>
                <Link
                  to="/complaints"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
                >
                  Report a campus issue
                </Link>
              </div>
            ) : (
              data.recentComplaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {complaint.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 truncate">
                      {complaint.category}
                      <span aria-hidden="true"> · </span>
                      {complaint.location}
                      <span aria-hidden="true"> · </span>
                      <span className="tabular-nums">
                        {formatDate(complaint.createdAt)}
                      </span>
                    </p>
                    {complaint.adminRemarks && (
                      <p className="mt-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-md px-3 py-1.5">
                        Update: {complaint.adminRemarks}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 pt-0.5">
                    <StatusIndicator status={complaint.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Upcoming Events Strip */}
      <section className="rounded-xl border border-slate-200/90 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              Upcoming College Events
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Workshops, hackathons, and campus programs open for registration
            </p>
          </div>
          <Link
            to="/events"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline whitespace-nowrap"
          >
            Browse all events
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {data.upcomingEvents.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 col-span-4">
              No upcoming events scheduled at the moment.
            </p>
          ) : (
            data.upcomingEvents.map((ev) => (
              <div
                key={ev._id}
                className="p-5 flex flex-col justify-between hover:bg-slate-50/60 transition-colors"
              >
                <div>
                  <p className="text-xs text-slate-500 tabular-nums">
                    <span className="font-medium text-blue-700">
                      {ev.category}
                    </span>
                    <span aria-hidden="true"> · </span>
                    {formatDate(ev.date)}
                  </p>
                  <h4 className="mt-1.5 text-sm font-semibold text-slate-900 line-clamp-2">
                    {ev.title}
                  </h4>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {ev.venue} · {ev.time}
                    </span>
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono tabular-nums text-slate-600">
                    {ev.registeredCount}/{ev.capacity} seats
                  </span>
                  <Link
                    to="/events"
                    className={`font-semibold ${
                      ev.isRegistered
                        ? 'text-emerald-700'
                        : 'text-blue-700 hover:underline'
                    }`}
                  >
                    {ev.isRegistered ? 'Registered' : 'View details'}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
};
