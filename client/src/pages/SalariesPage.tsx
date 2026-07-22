import { PageHeader } from '../components/PageHeader';
import { PlaceholderPanel } from '../components/PlaceholderPanel';

export function SalariesPage() {
  return (
    <>
      <PageHeader title="Salaries" description="Manage monthly salary payment records." />
      <PlaceholderPanel title="Salary module pending">
        Salary records and paid status handling are not implemented yet.
      </PlaceholderPanel>
    </>
  );
}
