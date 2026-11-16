import React, { useState, useEffect } from 'react';
import { Save, GraduationCap, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical & Electronics',
  'Artificial Intelligence & ML',
  'Campus Administration',
];

export const ProfilePage: React.FC = () => {
  const { user, updateUserState } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: user?.name || '',
    usn: user?.usn || '',
    department: user?.department || DEPARTMENTS[0],
    semester: user?.semester || 1,
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const refreshProfile = async () => {
      try {
        const fresh = await userService.getProfile();
        updateUserState(fresh);
        setForm({
          name: fresh.name,
          usn: fresh.usn || '',
          department: fresh.department,
          semester: fresh.semester || 1,
          phone: fresh.phone || '',
        });
      } catch {
        // Keep current context state
      }
    };
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        name: form.name,
        department: form.department,
        semester: user?.role === 'STUDENT' ? Number(form.semester) : undefined,
        usn: user?.role === 'STUDENT' ? form.usn : undefined,
        phone: form.phone,
      });
      updateUserState(updated);
      showToast('Profile details updated in database.', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update profile',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-3xl space-y-6"
    >
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
          My Campus Profile
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          View and update your personal academic information stored in CampusConnect.
        </p>
      </div>

      {/* Institutional Identity Header */}
      <section className="rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-6 text-white flex flex-col sm:flex-row sm:items-center gap-5 shadow-sm">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/25 text-white font-display text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-blue-100">
            {user?.role === 'ADMIN' ? (
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              {user?.role === 'ADMIN' ? 'Campus Administrator' : 'Student'}
            </span>
            {user?.usn && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{user.usn}</span>
              </>
            )}
          </div>
          <h3 className="font-display text-xl font-bold text-white truncate mt-1">
            {user?.name}
          </h3>
          <p className="text-sm text-blue-100/90 truncate">
            {user?.email}
            <span aria-hidden="true"> · </span>
            {user?.department}
          </p>
        </div>
      </section>

      {/* Profile Edit Form */}
      <section className="rounded-xl border border-slate-200/90 bg-white p-6">
        <div className="pb-4 mb-5 border-b border-slate-100">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Update Personal Details
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Changes sync immediately to your institutional MongoDB record.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Institutional Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 text-slate-500 border border-slate-200 rounded-lg cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user?.role === 'STUDENT' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  University Seat Number (USN)
                </label>
                <input
                  type="text"
                  required
                  value={form.usn}
                  onChange={(e) =>
                    setForm({ ...form, usn: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2.5 text-sm font-mono uppercase border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98450 00000"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={
                user?.role === 'STUDENT' ? 'sm:col-span-2' : 'sm:col-span-3'
              }
            >
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Department
              </label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {user?.role === 'STUDENT' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Semester
                </label>
                <select
                  value={form.semester}
                  onChange={(e) =>
                    setForm({ ...form, semester: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </section>
    </motion.div>
  );
};
