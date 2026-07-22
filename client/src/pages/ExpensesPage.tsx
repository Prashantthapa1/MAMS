import { PageHeader } from '../components/PageHeader';
import { PlaceholderPanel } from '../components/PlaceholderPanel';

export function ExpensesPage() {
  return (
    <>
      <PageHeader title="Expenses" description="Record and categorize business expenses." />
      <PlaceholderPanel title="Expense module pending">
        Expense CRUD with the required categories will be implemented later.
      </PlaceholderPanel>
    </>
  );
}
