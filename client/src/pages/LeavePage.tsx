import { PageHeader } from '../components/PageHeader';
import { PlaceholderPanel } from '../components/PlaceholderPanel';

export function LeavePage() {
  return (
    <>
      <PageHeader title="Leave" description="Submit, approve, and reject leave requests." />
      <PlaceholderPanel title="Leave management pending">
        Sick, casual, and annual leave workflows will be added after authentication.
      </PlaceholderPanel>
    </>
  );
}
