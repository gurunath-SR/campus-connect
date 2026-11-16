import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  CalendarDays,
  MapPin,
  Users,
  Pencil,
  Trash2,
  X,
  Upload,
} from 'lucide-react';
import { motion } from 'motion/react';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/LoadingSkeleton';
import type {
  CampusEvent,
  EventCategory,
  EventRegistrationItem,
} from '../types';

const EVENT_CATEGORIES: Array<'All' | EventCategory> = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
];

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'All' | EventCategory>('All');
  const [search, setSearch] = useState('');
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '10:00 AM',
    venue: '',
    category: 'Technical' as EventCategory,
    capacity: 100,
    organizer: 'Student Council',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [attendeesModal, setAttendeesModal] = useState<{
    event: CampusEvent;
    registrations: EventRegistrationItem[];
  } | null>(null);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CampusEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const list = await eventService.getAll({ category, search });
      setEvents(list);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to load events',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [category, search, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 180);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const handleToggleRegistration = async (ev: CampusEvent) => {
    setRegisteringId(ev._id);
    try {
      if (ev.isRegistered) {
        await eventService.cancelRegistration(ev._id);
        showToast(`Cancelled registration for "${ev.title}".`, 'info');
      } else {
        await eventService.register(ev._id);
        showToast(`Registered for "${ev.title}"!`, 'success');
      }
      fetchEvents();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Registration action failed',
        'error'
      );
    } finally {
      setRegisteringId(null);
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setForm({
      title: '',
      description: '',
      date: defaultDate.toISOString().split('T')[0],
      time: '10:00 AM',
      venue: '',
      category: 'Technical',
      capacity: 100,
      organizer: 'Department Student Association',
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const openEditModal = (ev: CampusEvent) => {
    setEditingEvent(ev);
    setForm({
      title: ev.title,
      description: ev.description,
      date: new Date(ev.date).toISOString().split('T')[0],
      time: ev.time,
      venue: ev.venue,
      category: ev.category,
      capacity: ev.capacity,
      organizer: ev.organizer,
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('date', form.date);
      fd.append('time', form.time);
      fd.append('venue', form.venue);
      fd.append('category', form.category);
      fd.append('capacity', String(form.capacity));
      fd.append('organizer', form.organizer);
      if (imageFile) {
        fd.append('image', imageFile);
      }

      if (editingEvent) {
        await eventService.update(editingEvent._id, fd);
        showToast('Event updated successfully.', 'success');
      } else {
        await eventService.create(fd);
        showToast('New event created.', 'success');
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save event',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const openAttendees = async (ev: CampusEvent) => {
    setLoadingAttendees(true);
    try {
      const res = await eventService.getRegistrations(ev._id);
      setAttendeesModal(res);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to load attendees',
        'error'
      );
    } finally {
      setLoadingAttendees(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await eventService.remove(deleteTarget._id);
      showToast('Event deleted.', 'success');
      setDeleteTarget(null);
      fetchEvents();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete event',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Campus Events & Workshops
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Explore upcoming technical hackathons, symposiums, workshops, and cultural programs.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/90 rounded-lg">
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                category === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events or venues..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <CalendarDays className="w-6 h-6" />
          </span>
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            No events scheduled
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Try switching category filters or check back for upcoming announcements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => {
            const seatsLeft = Math.max(0, ev.capacity - ev.registeredCount);
            const isFull = seatsLeft === 0;
            const fillRatio = Math.min(
              100,
              Math.round((ev.registeredCount / Math.max(1, ev.capacity)) * 100)
            );

            return (
              <article
                key={ev._id}
                className="group rounded-xl border border-slate-200/90 bg-white overflow-hidden flex flex-col transition-all duration-150 hover:border-blue-200 hover:shadow-[0_6px_24px_-6px_rgba(15,23,42,0.08)]"
              >
                <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                  {ev.imageUrl ? (
                    <img
                      src={ev.imageUrl}
                      alt={ev.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100/60 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                      <CalendarDays className="w-8 h-8 text-blue-600/60 mb-2" />
                      <span className="text-xs font-medium text-slate-500">
                        {ev.category} Event
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-blue-700">
                        {ev.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatDate(ev.date)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{ev.time}</span>
                    </div>

                    <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 leading-snug">
                      {ev.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {ev.description}
                    </p>

                    <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{ev.venue}</span>
                      </p>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-slate-700">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {ev.registeredCount} / {ev.capacity} registered
                            </span>
                          </span>
                          <span className="font-mono tabular-nums text-slate-500">
                            {seatsLeft} seats left
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFull ? 'bg-red-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${fillRatio}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500 truncate">
                      By {ev.organizer}
                    </span>

                    {isAdmin ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openAttendees(ev)}
                          disabled={loadingAttendees}
                          className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Attendees ({ev.registeredCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(ev)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                          aria-label="Edit event"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(ev)}
                          className="p-1.5 text-slate-500 hover:text-red-600 border border-slate-200 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors"
                          aria-label="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          registeringId === ev._id || (!ev.isRegistered && isFull)
                        }
                        onClick={() => handleToggleRegistration(ev)}
                        className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 ${
                          ev.isRegistered
                            ? 'text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-700 border border-slate-200'
                            : isFull
                            ? 'text-slate-500 bg-slate-100 cursor-not-allowed'
                            : 'text-white bg-blue-700 hover:bg-blue-800 shadow-xs'
                        }`}
                      >
                        {registeringId === ev._id
                          ? 'Updating...'
                          : ev.isRegistered
                          ? 'Registered (Cancel)'
                          : isFull
                          ? 'Capacity Full'
                          : 'Register Now'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Admin Create / Edit Event Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {editingEvent ? 'Edit Event' : 'Create Campus Event'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Annual Cloud & AI Workshop"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as EventCategory,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
                  >
                    {EVENT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Time
                  </label>
                  <input
                    type="text"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    placeholder="10:00 AM"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="Main Auditorium"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Organizer
                  </label>
                  <input
                    type="text"
                    required
                    value={form.organizer}
                    onChange={(e) =>
                      setForm({ ...form, organizer: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Event Banner Image (Optional)
                </label>
                <label className="flex items-center gap-2.5 border border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:bg-slate-50 text-xs text-slate-600">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span>
                    {imageFile ? imageFile.name : 'Choose banner image file'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setImageFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg disabled:opacity-60"
                >
                  {saving
                    ? 'Saving...'
                    : editingEvent
                    ? 'Save Changes'
                    : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin View Registered Students Modal */}
      {attendeesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl my-8">
            <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  Registered Students
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {attendeesModal.event.title} ·{' '}
                  <span className="font-mono tabular-nums">
                    {attendeesModal.registrations.length} /{' '}
                    {attendeesModal.event.capacity}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttendeesModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {attendeesModal.registrations.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No students have registered for this event yet.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">USN</th>
                      <th className="py-2.5 px-4">Department</th>
                      <th className="py-2.5 px-4 text-right">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendeesModal.registrations.map((reg) => (
                      <tr key={reg._id}>
                        <td className="py-2.5 px-4">
                          <p className="font-medium text-slate-900">
                            {reg.student?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {reg.student?.email}
                          </p>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-xs text-slate-700">
                          {reg.student?.usn || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-xs text-slate-600">
                          {reg.student?.department}
                        </td>
                        <td className="py-2.5 px-4 text-right text-xs font-mono text-slate-500 tabular-nums">
                          {formatDate(reg.registeredAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All student registrations for this event will also be removed.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
};
