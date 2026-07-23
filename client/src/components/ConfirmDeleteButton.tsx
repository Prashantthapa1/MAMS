import { Trash2 } from 'lucide-react';
import { useState } from 'react';

type ConfirmDeleteButtonProps = {
  label: string;
  onConfirm: () => Promise<void>;
};

export function ConfirmDeleteButton({ label, onConfirm }: ConfirmDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const confirmed = window.confirm(`Delete ${label}? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm();
    } catch (deleteError) {
      console.error(deleteError);
      setError(`Could not delete ${label}. Please try again.`);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-white text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleClick}
        disabled={isDeleting}
        aria-label={`Delete ${label}`}
        title={`Delete ${label}`}
      >
        <Trash2 size={16} />
      </button>
      {error ? <span className="sr-only" role="alert">{error}</span> : null}
    </div>
  );
}
