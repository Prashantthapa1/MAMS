import { PageHeader } from '../components/PageHeader';
import { PlaceholderPanel } from '../components/PlaceholderPanel';

export function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" description="Generate attendance, revenue, expense, profit, and salary reports." />
      <PlaceholderPanel title="Reports pending">
        Report views and CSV export will be implemented after the data modules are complete.
      </PlaceholderPanel>
    </>
  );
}
