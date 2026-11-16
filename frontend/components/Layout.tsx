import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  CalendarDays,
  PackageSearch,
  Users,
  UserCircle,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const routeMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Student Dashboard',
    subtitle: 'Academic overview & personal trackers',
  },
  '/admin': {
    title: 'Admin Console',
    subtitle: 'Campus operations & analytics',
  },
  '/announcements': {
    title: 'Announcements',
    subtitle: 'Official notices & circulars',
  },
  '/complaints': {
    title: 'Complaint Desk',
    subtitle: 'Campus maintenance & issue resolution',
  },
  '/events': {
    title: 'Campus Events',
    subtitle: 'Workshops, symposiums & registrations',
  },
  '/lost-found': {
    title: 'Lost & Found',
    subtitle: 'Campus item recovery board',
  },
  '/students': {
    title: 'Student Directory',
    subtitle: 'Registered student records',
  },
  '/profile': {
    title: 'My Profile',
    subtitle: 'Account & academic details',
  },
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const primaryNav = [
    {
      label: isAdmin ? 'Admin Console' : 'Dashboard',
      to: isAdmin ? '/admin' : '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Announcements',
      to: '/announcements',
      icon: Megaphone,
    },
    {
      label: 'Complaints',
      to: '/complaints',
      icon: MessageSquareWarning,
    },
    {
      label: 'Events',
      to: '/events',
      icon: CalendarDays,
    },
    {
      label: 'Lost & Found',
      to: '/lost-found',
      icon: PackageSearch,
    },
  ];

  const accountNav = [
    ...(isAdmin
      ? [
          {
            label: 'Students',
            to: '/students',
            icon: Users,
          },
        ]
      : []),
    {
      label: 'Profile',
      to: '/profile',
      icon: UserCircle,
    },
  ];

  const activeRoute = routeMeta[location.pathname] || {
    title: 'Portal',
    subtitle: 'CampusConnect',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavItem = (item: {
    label: string;
    to: string;
    icon: React.FC<{ className?: string }>;
  }) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={() => setMobileMenuOpen(false)}
        className={({ isActive }) =>
          `group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap shrink-0 ${
            isActive
              ? 'bg-blue-700 text-white shadow-xs shadow-blue-700/20'
              : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className="flex items-center gap-3">
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 group-hover:text-slate-700'
                }`}
              />
              <span>{item.label}</span>
            </span>
            {isActive && (
              <ChevronRight className="h-3.5 w-3.5 text-blue-200 shrink-0" />
            )}
          </>
        )}
      </NavLink>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-r border-slate-200/90">
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200/80">
        <Link
          to={isAdmin ? '/admin' : '/dashboard'}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2.5 text-slate-900 whitespace-nowrap shrink-0"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-xs">
            <GraduationCap className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            CampusConnect
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-md"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        <div>
          <p className="px-3.5 mb-2 text-xs font-medium text-slate-400">
            Campus Workspace
          </p>
          <div className="space-y-1">{primaryNav.map(renderNavItem)}</div>
        </div>

        <div>
          <p className="px-3.5 mb-2 text-xs font-medium text-slate-400">
            Administration & Account
          </p>
          <div className="space-y-1">{accountNav.map(renderNavItem)}</div>
        </div>
      </nav>

      <div className="border-t border-slate-200/80 p-4 bg-slate-50/70 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800 font-display font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {isAdmin ? 'Administrator' : user?.usn || 'Student'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors whitespace-nowrap shrink-0"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-50 w-64 max-w-[80vw] h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5 text-sm min-w-0">
              <span className="text-slate-400 hidden sm:inline font-medium">
                CampusConnect
              </span>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="font-display font-semibold text-slate-900 truncate">
                {activeRoute.title}
              </h1>
              <span className="text-slate-300 hidden md:inline" aria-hidden="true">
                ·
              </span>
              <span className="hidden md:inline text-xs text-slate-500 truncate">
                {activeRoute.subtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100/80 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 border border-blue-200/70 text-blue-700 font-semibold text-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
              <span className="hidden sm:inline">{user?.name}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
