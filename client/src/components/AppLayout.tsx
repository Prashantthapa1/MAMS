import {
  Banknote,
  BarChart3,
  Building2,
  CalendarCheck,
  ClipboardList,
  DollarSign,
  FileText,
  LayoutDashboard,
  Menu,
  Receipt,
  Settings,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Employees', path: '/employees', icon: UserRound },
  { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { label: 'Leave', path: '/leave', icon: ClipboardList },
  { label: 'Salaries', path: '/salaries', icon: Banknote },
  { label: 'Revenue', path: '/revenue', icon: DollarSign },
  { label: 'Expenses', path: '/expenses', icon: Receipt },
  { label: 'Profit', path: '/profit', icon: BarChart3 },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Staff Access', path: '/staff-access', icon: UserPlus },
] as const;

export function AppLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const visibleNavItems =
    user?.role === 'ADMIN' || user?.role === 'MANAGER'
      ? user.role === 'ADMIN' ? navItems : navItems.filter((item) => !['Settings', 'Staff Access'].includes(item.label))
      : navItems.filter((item) => ['Dashboard', 'Attendance', 'Leave'].includes(item.label));

  return (
    <div className="min-h-screen bg-[#faf8ff] lg:flex">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-900/10 transition-transform duration-200 lg:static lg:w-64 lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm">
              <Building2 size={20} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">StaffSync</p>
              <h1 className="text-base font-semibold text-slate-950">Employee Manager</h1>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNavItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md border-l-[3px] px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? 'border-blue-700 bg-blue-50 text-blue-700'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
          <p className="font-medium text-slate-700">
            {user?.fullName ?? 'Signed-in user'}
          </p>
          <p>{user?.role ?? 'Role unknown'}</p>
        </div>
      </aside>

      {isOpen && (
        <button
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 lg:hidden"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="text-sm text-slate-500">Small Business</p>
            <h2 className="text-base font-semibold text-slate-950">Management Dashboard</h2>
          </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-zinc-900">{user?.fullName}</p>
              <p className="text-xs text-zinc-500">{user?.role}</p>
            </div>
            <button
              type="button"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
