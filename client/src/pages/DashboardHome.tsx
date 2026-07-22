import { useAuth } from '../auth/AuthContext';
import { DashboardPage } from './DashboardPage';
import { StaffPortalPage } from './StaffPortalPage';

export function DashboardHome() {
  const { user } = useAuth();
  return user?.role === 'STAFF' ? <StaffPortalPage /> : <DashboardPage />;
}
