import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [heroImgError, setHeroImgError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      showToast(`Welcome back, ${loggedUser.name}`, 'success');
      navigate(loggedUser.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = (role: 'STUDENT' | 'ADMIN') => {
    setError('');
    if (role === 'ADMIN') {
      setEmail('admin@campusconnect.edu');
      setPassword('Admin@123');
    } else {
      setEmail('student@campusconnect.edu');
      setPassword('Student@123');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] grid grid-cols-1 lg:grid-cols-12">
      {/* Left Campus Architectural Visual Column */}
      <div className="hidden lg:flex lg:col-span-7 relative bg-slate-900 overflow-hidden items-end">
        {!heroImgError ? (
          <img
            src="/src/assets/images/campus_architecture_hero_1794837978644.jpg"
            alt="CampusConnect University Engineering Courtyard"
            referrerPolicy="no-referrer"
            onError={() => setHeroImgError(true)}
            className="absolute inset-0 h-full w-full object-cover scale-[1.01]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/55 to-blue-950/30" />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 p-12 max-w-2xl text-white"
        >
          <div className="flex items-center gap-3 mb-7">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-900/40">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">
              CampusConnect
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight leading-[1.15] text-balance">
            Centralized campus operations for students and administration.
          </h1>
          <p className="mt-4 text-base text-slate-200/95 leading-relaxed max-w-xl">
            Stay updated with verified academic circulars, report infrastructure issues with real-time resolution tracking, register for college events, and recover lost campus belongings in one portal.
          </p>

          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-6 text-sm">
            <div>
              <p className="font-display font-semibold text-white">Circulars</p>
              <p className="text-xs text-slate-300 mt-0.5">
                Verified academic notices
              </p>
            </div>
            <div>
              <p className="font-display font-semibold text-white">Issue Desk</p>
              <p className="text-xs text-slate-300 mt-0.5">
                Photo-backed resolution
              </p>
            </div>
            <div>
              <p className="font-display font-semibold text-white">Events</p>
              <p className="text-xs text-slate-300 mt-0.5">
                Live seat registrations
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Authentication Form Column */}
      <div className="lg:col-span-5 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-14 bg-white border-l border-slate-200/80">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md mx-auto"
        >
          <div className="flex items-center gap-2.5 lg:hidden mb-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold text-slate-900">
              CampusConnect
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter your institutional email and password to access the campus portal.
          </p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campusconnect.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-shadow"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-lg shadow-xs transition-all duration-150 whitespace-nowrap disabled:opacity-60"
            >
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts for Project Evaluation */}
          <div className="mt-8 pt-6 border-t border-slate-200/80">
            <p className="text-xs font-medium text-slate-500 mb-3">
              Quick-Fill Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillDemoCredentials('STUDENT')}
                className="group p-3 text-xs bg-slate-50/80 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 rounded-lg transition-all text-left"
              >
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-blue-800">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Student Demo</span>
                </div>
                <span className="block text-slate-500 truncate mt-1">
                  student@campusconnect.edu
                </span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('ADMIN')}
                className="group p-3 text-xs bg-slate-50/80 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 rounded-lg transition-all text-left"
              >
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-blue-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Admin Demo</span>
                </div>
                <span className="block text-slate-500 truncate mt-1">
                  admin@campusconnect.edu
                </span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            New student on campus?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
            >
              Create student account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
