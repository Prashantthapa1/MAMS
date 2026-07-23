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
      <section className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Loading data…
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-800 shadow-sm" role="alert">
        {error}
      </section>
    );
  }

  if (isEmpty) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
        {emptyMessage}
      </section>
    );
  }

  return children;
}
