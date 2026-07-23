import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { AppLayout } from './components/AppLayout';
import { RequireRole } from './components/RequireRole';
const AttendancePage = lazy(() => import('./pages/AttendancePage').then(({ AttendancePage }) => ({ default: AttendancePage })));
const AcceptInvitationPage = lazy(() => import('./pages/AcceptInvitationPage').then(({ AcceptInvitationPage }) => ({ default: AcceptInvitationPage })));
const DashboardHome = lazy(() => import('./pages/DashboardHome').then(({ DashboardHome }) => ({ default: DashboardHome })));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage').then(({ EmployeesPage }) => ({ default: EmployeesPage })));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage').then(({ ExpensesPage }) => ({ default: ExpensesPage })));
const LeavePage = lazy(() => import('./pages/LeavePage').then(({ LeavePage }) => ({ default: LeavePage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(({ LoginPage }) => ({ default: LoginPage })));
const ProfitPage = lazy(() => import('./pages/ProfitPage').then(({ ProfitPage }) => ({ default: ProfitPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(({ ReportsPage }) => ({ default: ReportsPage })));
const RevenuePage = lazy(() => import('./pages/RevenuePage').then(({ RevenuePage }) => ({ default: RevenuePage })));
const SalariesPage = lazy(() => import('./pages/SalariesPage').then(({ SalariesPage }) => ({ default: SalariesPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(({ SettingsPage }) => ({ default: SettingsPage })));
const StaffAccessPage = lazy(() => import('./pages/StaffAccessPage').then(({ StaffAccessPage }) => ({ default: StaffAccessPage })));
const EmployeeProfilePage = lazy(() => import('./pages/EmployeeProfilePage').then(({ EmployeeProfilePage }) => ({ default: EmployeeProfilePage })));

export default function App() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#faf8ff] text-sm text-slate-600">Loading workspace...</div>}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route
          path="/employees"
          element={
            <RequireRole allowedRoles={['ADMIN', 'MANAGER']}>
              <EmployeesPage />
            </RequireRole>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <RequireRole allowedRoles={['ADMIN', 'MANAGER']}>
              <EmployeeProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="/attendance"
          element={
            <RequireRole allowedRoles={['ADMIN', 'MANAGER', 'STAFF']}>
              <AttendancePage />
            </RequireRole>
          }
        />
        <Route path="/leave" element={<LeavePage />} />
        <Route
          path="/salaries"
          element={
            <RequireRole allowedRoles={['ADMIN', 'MANAGER']}>
              <SalariesPage />
            </RequireRole>
          }
        />
        <Route
          path="/revenue"
          element={
            <RequireRole allowedRoles={['ADMIN', 'MANAGER']}>
              <RevenuePage />
            </RequireRole>
          }
        />
        <Route
          path="/expenses"
          element={
            <RequireRole allowedRoles={['ADMIN', 'MANAGER']}>
              <ExpensesPage />
            </RequireRole>
          }
        />
        <Route path="/profit" element={<RequireRole allowedRoles={['ADMIN', 'MANAGER']}><ProfitPage /></RequireRole>} />
        <Route path="/reports" element={<RequireRole allowedRoles={['ADMIN', 'MANAGER']}><ReportsPage /></RequireRole>} />
        <Route path="/settings" element={<RequireRole allowedRoles={['ADMIN']}><SettingsPage /></RequireRole>} />
        <Route path="/staff-access" element={<RequireRole allowedRoles={['ADMIN']}><StaffAccessPage /></RequireRole>} />
      </Route>
    </Routes>
    </Suspense>
  );
}
