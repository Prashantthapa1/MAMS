import { PageHeader } from '../components/PageHeader';
import { PlaceholderPanel } from '../components/PlaceholderPanel';

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage company name, address, and currency." />
      <PlaceholderPanel title="Settings pending">
        Company settings will be connected to the backend after persistence is added.
      </PlaceholderPanel>
    </>
  );
}
