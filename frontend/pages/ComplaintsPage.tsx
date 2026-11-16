import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  Image as ImageIcon,
  Eye,
  Trash2,
  X,
  Upload,
  MessageSquareWarning,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusIndicator } from '../components/StatusIndicator';
import { TableSkeleton } from '../components/LoadingSkeleton';
import type {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
} from '../types';

const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Electrical',
  'Water',
  'Classroom',
  'Internet',
  'Cleaning',
  'Other',
];

const STATUS_FILTERS: Array<'All' | ComplaintStatus> = [
  'All',
  'Pending',
  'In Progress',
  'Resolved',
];

export const ComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | ComplaintStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Electrical' as ComplaintCategory,
    location: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [statusDraft, setStatusDraft] = useState<ComplaintStatus>('Pending');
  const [remarksDraft, setRemarksDraft] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Complaint | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const list = await complaintService.getAll({
        status: statusFilter,
        category: categoryFilter,
        search,
      });
      setComplaints(list);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to load complaints',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComplaints();
    }, 180);
    return () => clearTimeout(timer);
  }, [fetchComplaints]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(String(reader.result || ''));
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('location', form.location);
      fd.append('description', form.description);
      if (imageFile) {
        fd.append('image', imageFile);
      }

      await complaintService.create(fd);
      showToast('Complaint submitted successfully.', 'success');
      setCreateOpen(false);
      setForm({
        title: '',
        category: 'Electrical',
        location: '',
        description: '',
      });
      setImageFile(null);
      setImagePreview('');
      fetchComplaints();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to submit complaint',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openDetails = (item: Complaint) => {
    setSelectedComplaint(item);
    setStatusDraft(item.status);
    setRemarksDraft(item.adminRemarks || '');
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdatingStatus(true);
    try {
      const updated = await complaintService.updateStatus(
        selectedComplaint._id,
        statusDraft,
        remarksDraft
      );
      setSelectedComplaint(updated);
      showToast(`Complaint marked as ${statusDraft}.`, 'success');
      fetchComplaints();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update status',
        'error'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await complaintService.remove(deleteTarget._id);
      showToast('Complaint deleted.', 'success');
      setDeleteTarget(null);
      fetchComplaints();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete complaint',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const getStepIndex = (status: ComplaintStatus) => {
    if (status === 'Pending') return 0;
    if (status === 'In Progress') return 1;
    return 2;
  };

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
            Campus Complaint Desk
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {isAdmin
              ? 'Review student-reported facility issues, inspect photos, and update resolution progress.'
              : 'Report campus maintenance issues with photos and track live administration updates.'}
          </p>
        </div>

        {!isAdmin && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Complaint</span>
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-lg">
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="All">All Categories</option>
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject or location..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : complaints.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <MessageSquareWarning className="w-6 h-6" />
          </span>
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            No complaints match your filter
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? 'All filtered complaint queues are clear.'
              : 'Submit a new campus issue if you notice electrical, water, internet, or classroom problems.'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-medium text-slate-500">
                  <th className="py-3.5 px-6">Complaint & Location</th>
                  {isAdmin && <th className="py-3.5 px-4">Reported By</th>}
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {complaints.map((item) => {
                  const canDelete = isAdmin || item.status === 'Pending';
                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          {item.imageUrl ? (
                            <button
                              type="button"
                              onClick={() => openDetails(item)}
                              className="h-11 w-11 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:opacity-90 transition-opacity"
                              title="Inspect attached photo"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ) : (
                            <span className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-400">
                              <ImageIcon className="w-4 h-4" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {item.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-4">
                          <p className="text-slate-900 font-medium">
                            {item.student?.name}
                          </p>
                          <p className="text-xs font-mono text-slate-500">
                            {item.student?.usn || item.student?.department}
                          </p>
                        </td>
                      )}
                      <td className="py-4 px-4 text-slate-700 font-medium">
                        {item.category}
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-slate-500 tabular-nums whitespace-nowrap">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <StatusIndicator status={item.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openDetails(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isAdmin ? 'Manage' : 'Updates'}</span>
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              aria-label="Delete complaint"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submit Complaint Modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Submit Campus Complaint
              </h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Projector not turning on in Lecture Hall 204"
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
                        category: e.target.value as ComplaintCategory,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    {COMPLAINT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Location / Room
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="e.g., CSE Block — Room 302"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Issue Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the problem clearly so maintenance staff can locate and fix it..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Attach Issue Photo (Optional)
                </label>
                <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
                  <span className="text-xs font-medium text-slate-600">
                    {imageFile
                      ? imageFile.name
                      : 'Click to upload JPG, PNG, or WEBP (Max 5MB)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Issue preview"
                    className="mt-3 h-36 w-full object-cover rounded-lg border border-slate-200"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Details & Status History / Admin Update Modal */}
      {selectedComplaint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl my-8 space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-blue-700">
                    {selectedComplaint.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedComplaint.location}</span>
                  <span aria-hidden="true">·</span>
                  <StatusIndicator status={selectedComplaint.status} />
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900 mt-1.5">
                  {selectedComplaint.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Resolution Progress Stepper */}
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 border border-slate-200/80 p-3">
              {(['Pending', 'In Progress', 'Resolved'] as const).map(
                (step, idx) => {
                  const currentIdx = getStepIndex(selectedComplaint.status);
                  const reached = idx <= currentIdx;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-mono font-semibold ${
                          reached
                            ? 'bg-blue-700 text-white'
                            : 'bg-white border border-slate-200 text-slate-400'
                        }`}
                      >
                        {reached && idx < currentIdx ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          reached ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                }
              )}
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {selectedComplaint.description}
            </p>

            {selectedComplaint.imageUrl && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">
                  Uploaded Evidence Photo
                </p>
                <img
                  src={selectedComplaint.imageUrl}
                  alt={selectedComplaint.title}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-64 object-cover rounded-lg border border-slate-200"
                />
              </div>
            )}

            {/* Status Timeline */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">
                Resolution History
              </h4>
              <div className="space-y-2.5">
                {selectedComplaint.statusHistory?.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-4 text-xs border border-slate-200/80 bg-slate-50/70 rounded-lg px-3.5 py-2.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusIndicator status={entry.status} />
                        {entry.updatedBy && (
                          <span className="text-slate-500">
                            by {entry.updatedBy.name}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-slate-700">{entry.remark}</p>
                    </div>
                    <span className="font-mono text-slate-500 shrink-0 tabular-nums">
                      {formatDateTime(entry.updatedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Status Update Controls */}
            {isAdmin && (
              <form
                onSubmit={handleStatusUpdate}
                className="border-t border-slate-200 pt-4 space-y-3"
              >
                <h4 className="text-sm font-semibold text-slate-900">
                  Update Complaint Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      New Status
                    </label>
                    <select
                      value={statusDraft}
                      onChange={(e) =>
                        setStatusDraft(e.target.value as ComplaintStatus)
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Admin Remarks
                    </label>
                    <input
                      type="text"
                      value={remarksDraft}
                      onChange={(e) => setRemarksDraft(e.target.value)}
                      placeholder="Add action taken or technician assignment..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg disabled:opacity-60"
                  >
                    {updatingStatus ? 'Updating...' : 'Save Status Update'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Complaint"
        message={`Are you sure you want to remove "${deleteTarget?.title}"?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
};
