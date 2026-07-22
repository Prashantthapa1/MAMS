const toneByStatus: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Present: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Inactive: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
  Absent: 'bg-red-50 text-red-700 ring-red-200',
  Rejected: 'bg-red-50 text-red-700 ring-red-200',
};

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ${toneByStatus[status]}`}>
      {status}
    </span>
  );
}
