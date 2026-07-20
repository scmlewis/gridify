import { useEffect, useRef, useState } from 'react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  message: string;
  action?: ToastAction;
  duration?: number;
  onDismiss?: () => void;
}

export function Toast({ message, action, duration = 5000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismissRef.current?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-[calc(var(--nav-h)+1rem)] left-1/2 z-50 -translate-x-1/2 animate-slide-up-sheet">
      <div className="flex items-center gap-3 rounded-xl bg-surface-elevated/95 backdrop-blur-md px-4 py-3 shadow-xl shadow-black/20 border border-border/60">
        <span className="text-sm text-text-primary">{message}</span>
        {action && (
          <button
            onClick={() => {
              action.onClick();
              setVisible(false);
            }}
            className="text-sm font-semibold text-primary hover:text-primary-light transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
