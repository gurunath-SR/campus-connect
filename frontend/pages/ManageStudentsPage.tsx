import React, { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TableSkeleton } from '../components/LoadingSkeleton';
import type { User } from '../types';

const DEPARTMENTS = [
  'All',
  'Computer Science & Engineering',
  'Information Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical & Electronics',
  'Artificial Intelligence & ML',
];

export const ManageStudentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const list = await userService.getAllStudents({ search, department });
      setStudents(list);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to load student directory',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [search, department, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 180);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userService.deleteStudent(deleteTarget._id);
      showToast('Student account removed.', 'success');
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete student',
        'error'
      );
    } finally {
      setDeleting(false);
    }
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
            Student Directory
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            View registered students across departments, verify USN records, and manage student accounts.
          </p>
        </div>
        {!loading && (
          <div className="text-xs font-mono tabular-nums text-slate-600 bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 shrink-0">
            {students.length} registered {students.length === 1 ? 'student' : 'students'}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          aria-label="Filter by department"
          className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
        >
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept === 'All' ? 'All Departments' : dept}
            </option>
          ))}
        </select>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, USN, or email..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Users className="w-6 h-6" />
          </span>
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            No students found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            No student records match your current search or department filter.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-medium text-slate-500">
                  <th className="py-3.5 px-6">Student Name</th>
                  <th className="py-3.5 px-4">USN</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map((st) => (
                  <tr
                    key={st._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-display font-bold text-xs">
                          {st.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {st.name}
                          </p>
                          <p className="text-xs text-slate-500">{st.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                      {st.usn || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {st.department}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700 tabular-nums">
                      Sem {st.semester || 1}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-mono">
                      {st.phone || '—'}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(st)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove Student Account"
        message={`Are you sure you want to delete ${deleteTarget?.name} (${deleteTarget?.usn})? Their complaints and event registrations will also be deleted.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
};
