type DataStateProps = {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
};

export function DataState({ isLoading, error, isEmpty, emptyMessage, children }: DataStateProps) {
  if (isLoading) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
        Loading data...
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </section>
    );
  }

  if (isEmpty) {
    return (
      <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600">
        {emptyMessage}
      </section>
    );
  }

  return children;
}
