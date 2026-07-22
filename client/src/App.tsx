import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { AppLayout } from './components/AppLayout';
import { RequireRole } from './components/RequireRole';
import { AttendancePage } from './pages/AttendancePage';
import { AcceptInvitationPage } from './pages/AcceptInvitationPage';
import { DashboardHome } from './pages/DashboardHome';
import { EmployeesPage } from './pages/EmployeesPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { LeavePage } from './pages/LeavePage';
import { LoginPage } from './pages/LoginPage';
import { ProfitPage } from './pages/ProfitPage';
import { ReportsPage } from './pages/ReportsPage';
import { RevenuePage } from './pages/RevenuePage';
import { SalariesPage } from './pages/SalariesPage';
import { SettingsPage } from './pages/SettingsPage';
import { StaffAccessPage } from './pages/StaffAccessPage';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';

export default function App() {
  return (
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
        <Route path="/salaries" element={<SalariesPage />} />
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
  );
}
