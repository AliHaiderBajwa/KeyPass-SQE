import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import type { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const icons: Record<Toast['type'], React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <AlertTriangle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const styles: Record<Toast['type'], string> = {
  success: 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)]/30 text-[var(--color-accent)]',
  error: 'bg-[var(--color-danger-subtle)] border-[var(--color-danger)]/30 text-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning-subtle)] border-[var(--color-warning)]/30 text-[var(--color-warning)]',
  info: 'bg-[var(--color-info-subtle)] border-[var(--color-info)]/30 text-[var(--color-info)]',
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm animate-in slide-in-from-right ${styles[toast.type]}`}
        >
          {icons[toast.type]}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
