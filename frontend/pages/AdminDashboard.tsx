import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Megaphone,
  MessageSquareWarning,
  CalendarDays,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'motion/react';
import { dashboardService } from '../services/dashboardService';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { StatusIndicator } from '../components/StatusIndicator';
import type { AdminDashboardData } from '../types';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await dashboardService.getAdminDashboard();
        setData(res);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load admin metrics'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6 text-sm text-red-700">
        {error || 'Failed to load admin dashboard.'}
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 p-6 sm:p-8 text-white shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-blue-500/20 blur-2xl"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-blue-200">
              Administration Control Center
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-1 text-balance">
              Campus Operations Overview
            </h2>
            <p className="text-sm text-blue-100/90 mt-1.5 max-w-xl">
              Monitor student registrations, resolve facility complaints, and publish official campus notices and events.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/announcements"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-900 bg-white hover:bg-blue-50 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Post Announcement</span>
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Manage Events</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5 KPI Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 transition-all duration-150 hover:border-blue-200 hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Registered Students
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
            {data.stats.totalStudents}
          </p>
          <Link
            to="/students"
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
          >
            <span>View directory</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 transition-all duration-150 hover:border-blue-200 hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Announcements
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-700">
              <Megaphone className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
            {data.stats.totalAnnouncements}
          </p>
          <p className="mt-2.5 text-xs text-slate-500">Active notices</p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 transition-all duration-150 hover:border-slate-300 hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Total Complaints
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
              <MessageSquareWarning className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
            {data.stats.totalComplaints}
          </p>
          <p className="mt-2.5 text-xs text-slate-500 tabular-nums">
            {data.stats.inProgressComplaints} in progress
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 transition-all duration-150 hover:border-amber-200 hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Pending / Open
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 border border-red-100 text-red-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
            {data.stats.pendingComplaints + data.stats.inProgressComplaints}
          </p>
          <p className="mt-2.5 text-xs font-medium text-emerald-700 tabular-nums">
            {data.stats.resolvedComplaints} resolved
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-5 transition-all duration-150 hover:border-blue-200 hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Upcoming Events
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-700">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
            {data.stats.totalUpcomingEvents}
          </p>
          <p className="mt-2.5 text-xs text-slate-500 tabular-nums">
            {data.stats.openLostFoundCount} Lost & Found open
          </p>
        </div>
      </section>

      {/* Complaint Analytics Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-slate-200/90 bg-white p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                Complaints by Category
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active vs resolved issues across campus departments
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-blue-600" />
                <span>Pending / Active</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600" />
                <span>Resolved</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.charts.complaintsByCategory}
                margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E2E8F0"
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12, fill: '#475569' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="open"
                  name="Pending / Active"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                  barSize={22}
                />
                <Bar
                  dataKey="resolved"
                  name="Resolved"
                  fill="#16A34A"
                  radius={[4, 4, 0, 0]}
                  barSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200/90 bg-white p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              Resolution Status Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribution of all campus complaints by current status
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.complaintsByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {data.charts.complaintsByStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
            {data.charts.complaintsByStatus.map((item) => (
              <div
                key={item.name}
                className="text-center rounded-lg bg-slate-50/70 py-2 px-1"
              >
                <p className="text-xs text-slate-500">{item.name}</p>
                <p
                  className="font-display text-lg font-bold tabular-nums mt-0.5"
                  style={{ color: item.color }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Complaints Table */}
      <section className="rounded-xl border border-slate-200/90 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              Recent Student Complaints
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest facility issues reported across campus
            </p>
          </div>
          <Link
            to="/complaints"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline whitespace-nowrap"
          >
            Open complaint desk
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Issue</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Reported</th>
                <th className="py-3 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.recentComplaints.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-6">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.location}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-slate-900">{item.student?.name}</p>
                    <p className="text-xs font-mono text-slate-500">
                      {item.student?.usn || item.student?.department}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-xs tabular-nums">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="inline-flex justify-end">
                      <StatusIndicator status={item.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
};
