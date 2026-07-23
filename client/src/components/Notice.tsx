import { CheckCircle2, CircleAlert } from 'lucide-react';

type NoticeProps = {
  tone: 'success' | 'error';
  children: React.ReactNode;
};

export function Notice({ tone, children }: NoticeProps) {
  const isSuccess = tone === 'success';

  return (
    <div
      className={`mb-5 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
      role={isSuccess ? 'status' : 'alert'}
      aria-live="polite"
    >
      {isSuccess ? <CheckCircle2 className="mt-0.5 shrink-0" size={18} /> : <CircleAlert className="mt-0.5 shrink-0" size={18} />}
      <span>{children}</span>
    </div>
  );
}
