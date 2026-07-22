import { PageHeader } from '../components/PageHeader';
import { PlaceholderPanel } from '../components/PlaceholderPanel';

export function RevenuePage() {
  return (
    <>
      <PageHeader title="Revenue" description="Record daily business revenue." />
      <PlaceholderPanel title="Revenue module pending">
        Manual revenue add, edit, and delete workflows will be implemented later.
      </PlaceholderPanel>
    </>
  );
}
