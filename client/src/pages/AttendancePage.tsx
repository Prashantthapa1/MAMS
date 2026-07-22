import { PageHeader } from '../components/PageHeader';
import { PlaceholderPanel } from '../components/PlaceholderPanel';

export function AttendancePage() {
  return (
    <>
      <PageHeader title="Attendance" description="Track check in, check out, status, and working hours." />
      <PlaceholderPanel title="Attendance module pending">
        Admin attendance management and staff self-view will be implemented in the attendance task section.
      </PlaceholderPanel>
    </>
  );
}
