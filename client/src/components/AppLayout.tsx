import { Menu } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  ['Dashboard', '/dashboard'],
  ['Employees', '/employees'],
  ['Attendance', '/attendance'],
  ['Leave', '/leave'],
  ['Salaries', '/salaries'],
  ['Revenue', '/revenue'],
  ['Expenses', '/expenses'],
  ['Profit', '/profit'],
  ['Reports', '/reports'],
  ['Settings', '/settings'],
] as const;

export function AppLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-zinc-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-zinc-200 px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">EMS</p>
          <h1 className="text-lg font-semibold text-zinc-950">Employee Manager</h1>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
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
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white px-4 lg:px-6">
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
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
