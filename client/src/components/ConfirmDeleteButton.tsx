import { Trash2 } from 'lucide-react';
import { useState } from 'react';

type ConfirmDeleteButtonProps = {
  label: string;
  onConfirm: () => Promise<void>;
};

export function ConfirmDeleteButton({ label, onConfirm }: ConfirmDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleClick() {
    const confirmed = window.confirm(`Delete ${label}? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      onClick={handleClick}
      disabled={isDeleting}
      aria-label={`Delete ${label}`}
      title={`Delete ${label}`}
    >
      <Trash2 size={16} />
    </button>
  );
}
