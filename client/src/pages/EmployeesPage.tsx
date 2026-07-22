import { PageHeader } from '../components/PageHeader';
import { PlaceholderPanel } from '../components/PlaceholderPanel';

export function EmployeesPage() {
  return (
    <>
      <PageHeader title="Employees" description="Add, edit, delete, and view employee profiles." />
      <PlaceholderPanel title="Employee module pending">
        Employee CRUD and profile views will be implemented from `tasks.md`.
      </PlaceholderPanel>
    </>
  );
}
