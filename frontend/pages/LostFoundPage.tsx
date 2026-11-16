import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  PackageSearch,
  MapPin,
  Phone,
  CheckCircle2,
  Trash2,
  X,
  Upload,
} from 'lucide-react';
import { motion } from 'motion/react';
import { lostFoundService } from '../services/lostFoundService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusIndicator } from '../components/StatusIndicator';
import { TableSkeleton } from '../components/LoadingSkeleton';
import type {
  LostFoundItem,
  LostFoundStatus,
  LostFoundType,
} from '../types';

export const LostFoundPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'All' | LostFoundType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | LostFoundStatus>('All');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    itemName: '',
    type: 'Lost' as LostFoundType,
    location: '',
    date: new Date().toISOString().split('T')[0],
    contactInfo: user?.email || '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<LostFoundItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const list = await lostFoundService.getAll({
        type: typeFilter,
        status: statusFilter,
        search,
      });
      setItems(list);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to load items',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, search, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 180);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  const openReportModal = () => {
    setForm({
      itemName: '',
      type: 'Lost',
      location: '',
      date: new Date().toISOString().split('T')[0],
      contactInfo: user?.phone
        ? `${user.email} · ${user.phone}`
        : user?.email || '',
      description: '',
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('itemName', form.itemName);
      fd.append('type', form.type);
      fd.append('location', form.location);
      fd.append('date', form.date);
      fd.append('contactInfo', form.contactInfo);
      fd.append('description', form.description);
      if (imageFile) {
        fd.append('image', imageFile);
      }

      await lostFoundService.create(fd);
      showToast(`${form.type} item report posted.`, 'success');
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to report item',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (
    item: LostFoundItem,
    nextStatus: LostFoundStatus
  ) => {
    try {
      await lostFoundService.updateStatus(item._id, nextStatus);
      showToast(`Item marked as ${nextStatus}.`, 'success');
      fetchItems();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update status',
        'error'
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await lostFoundService.remove(deleteTarget._id);
      showToast('Item removed.', 'success');
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete item',
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
            Campus Lost & Found
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Report lost belongings or post found items across campus blocks, labs, and libraries.
          </p>
        </div>

        <button
          type="button"
          onClick={openReportModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report Lost / Found</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-lg">
            {(['All', 'Lost', 'Found'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'All' ? 'All Reports' : `${t} Items`}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'All' | LostFoundStatus)
            }
            aria-label="Filter by item status"
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Claimed">Claimed</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item or location..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <PackageSearch className="w-6 h-6" />
          </span>
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            No items found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your filters or report a missing or found item.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item) => {
            const canModify =
              isAdmin || String(item.reportedBy?._id) === String(user?._id);

            return (
              <article
                key={item._id}
                className="rounded-xl border border-slate-200/90 bg-white p-6 flex flex-col justify-between gap-4 transition-all duration-150 hover:border-blue-200 hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <StatusIndicator status={item.type} />
                    <StatusIndicator status={item.status} />
                  </div>

                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.itemName}
                      referrerPolicy="no-referrer"
                      className="h-44 w-full object-cover rounded-lg border border-slate-200"
                    />
                  )}

                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      {item.itemName}
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50/80 border border-slate-200/70 p-3 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {item.location}
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono tabular-nums">
                          {formatDate(item.date)}
                        </span>
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700">
                        {item.contactInfo}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 truncate">
                    Reported by {item.reportedBy?.name || 'Campus Member'}
                  </span>

                  {canModify && (
                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'Open' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item, 'Claimed')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Claimed</span>
                        </button>
                      )}
                      {isAdmin && item.status === 'Claimed' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item, 'Resolved')}
                          className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200/80 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        aria-label="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Report Lost/Found Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Report Lost or Found Item
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.itemName}
                    onChange={(e) =>
                      setForm({ ...form, itemName: e.target.value })
                    }
                    placeholder="e.g., Blue HP Laptop Sleeve"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Report Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as LostFoundType,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="Central Library / Block A"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contact Information
                </label>
                <input
                  type="text"
                  required
                  value={form.contactInfo}
                  onChange={(e) =>
                    setForm({ ...form, contactInfo: e.target.value })
                  }
                  placeholder="Email or phone number for pickup"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Item Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Color, brand, distinguishing marks..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Photo (Optional)
                </label>
                <label className="flex items-center gap-2.5 border border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:bg-slate-50 text-xs text-slate-600">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span>
                    {imageFile ? imageFile.name : 'Upload item photo'}
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
                  {saving ? 'Submitting...' : 'Post Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove Report"
        message={`Are you sure you want to remove "${deleteTarget?.itemName}" from Lost & Found?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
};
