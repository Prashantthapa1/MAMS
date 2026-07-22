type PlaceholderPanelProps = {
  title: string;
  children: React.ReactNode;
};

export function PlaceholderPanel({ title, children }: PlaceholderPanelProps) {
  return (
    <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-6">
      <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">{children}</p>
    </section>
  );
}
