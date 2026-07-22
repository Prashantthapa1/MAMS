import { PageHeader } from '../components/PageHeader';
import { PlaceholderPanel } from '../components/PlaceholderPanel';

export function ProfitPage() {
  return (
    <>
      <PageHeader title="Profit" description="Profit is calculated from revenue minus expenses." />
      <PlaceholderPanel title="Profit module pending">
        Automatic daily and monthly profit summaries will be implemented after revenue and expenses.
      </PlaceholderPanel>
    </>
  );
}
