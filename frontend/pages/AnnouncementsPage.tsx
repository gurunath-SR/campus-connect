import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, X, Megaphone } from 'lucide-react';
import { motion } from 'motion/react';
import { announcementService } from '../services/announcementService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusIndicator } from '../components/StatusIndicator';
import { TableSkeleton } from '../components/LoadingSkeleton';
import type {
  Announcement,
  AnnouncementCategory,
  AnnouncementPriority,
} from '../types';

const CATEGORIES: Array<'All' | AnnouncementCategory> = [
  'All',
  'Academic',
  'Examination',
  'Events',
  'Placement',
  'General',
];

const PRIORITIES: AnnouncementPriority[] = ['Normal', 'Important', 'Urgent'];

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'All' | AnnouncementCategory>('All');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    category: AnnouncementCategory;
    priority: AnnouncementPriority;
  }>({
    title: '',
    description: '',
    category: 'General',
    priority: 'Normal',
  });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const list = await announcementService.getAll({ category, search });
      setAnnouncements(list);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to load announcements',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [category, search, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnnouncements();
    }, 180);
    return () => clearTimeout(timer);
  }, [fetchAnnouncements]);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      title: '',
      description: '',
      category: 'Academic',
      priority: 'Normal',
    });
    setModalOpen(true);
  };

  const openEditModal = (item: Announcement) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await announcementService.update(editingItem._id, form);
        showToast('Announcement updated successfully.', 'success');
      } else {
        await announcementService.create(form);
        showToast('Announcement published to campus.', 'success');
      }
      setModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save announcement',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await announcementService.remove(deleteTarget._id);
      showToast('Announcement deleted.', 'success');
      setDeleteTarget(null);
      fetchAnnouncements();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete announcement',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  const getDateParts = (iso: string) => {
    const d = new Date(iso);
    return {
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      day: d.toLocaleDateString('en-US', { day: '2-digit' }),
      year: d.getFullYear(),
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Campus Announcements
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Official academic circulars, examination notices, and placement updates.
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/90 rounded-lg">
          {CATEGORIES.map((cat) => (
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
            placeholder="Search circulars..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : announcements.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Megaphone className="w-6 h-6" />
          </span>
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            No announcements found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Try clearing your search query or selecting a different category.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => {
            const dp = getDateParts(item.createdAt);
            const isUrgent = item.priority === 'Urgent';

            return (
              <article
                key={item._id}
                className={`rounded-xl border p-5 sm:p-6 transition-all duration-150 hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] ${
                  isUrgent
                    ? 'border-red-200/90 bg-red-50/25 hover:border-red-300'
                    : 'border-slate-200/90 bg-white hover:border-blue-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Calendar Leaf Date Tile */}
                    <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 shrink-0 rounded-lg border border-slate-200 bg-slate-50/80 text-center">
                      <span className="text-[11px] font-semibold text-blue-700 leading-none">
                        {dp.month}
                      </span>
                      <span className="font-display text-lg font-bold text-slate-900 tabular-nums leading-tight mt-0.5">
                        {dp.day}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-blue-700">
                          {item.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {dp.month} {dp.day}, {dp.year}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Posted by {item.author?.name || 'Administration'}
                        </span>
                        {item.priority !== 'Normal' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <StatusIndicator status={item.priority} />
                          </>
                        )}
                      </div>

                      <h3 className="font-display text-lg font-semibold text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {editingItem ? 'Edit Announcement' : 'Publish Announcement'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter announcement headline"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
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
                        category: e.target.value as AnnouncementCategory,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value as AnnouncementPriority,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Provide full details, dates, and instructions..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
                    : editingItem
                    ? 'Save Changes'
                    : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? Students will no longer see this circular.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
};
