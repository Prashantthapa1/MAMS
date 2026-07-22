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
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

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
] as const;

export function AppLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-100 lg:flex">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-zinc-200 bg-white shadow-xl shadow-zinc-900/10 transition-transform duration-200 lg:static lg:w-64 lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <Building2 size={20} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">EMS</p>
              <h1 className="text-base font-semibold text-zinc-950">Employee Manager</h1>
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
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-zinc-200 p-4 text-xs text-zinc-500">
          Admin workspace
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
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur lg:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 lg:hidden"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="text-sm text-zinc-500">Small Business</p>
            <h2 className="text-base font-semibold text-zinc-950">Management Dashboard</h2>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
