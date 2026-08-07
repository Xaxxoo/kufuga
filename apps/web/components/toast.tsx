'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastAPI {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastAPI | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((type: ToastType, message: string) => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const api: ToastAPI = {
    success: useCallback((msg: string) => add('success', msg), [add]),
    error: useCallback((msg: string) => add('error', msg), [add]),
    info: useCallback((msg: string) => add('info', msg), [add]),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" aria-live="polite" role="status">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-slide-in rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur-sm ${typeStyles[toast.type]}`}
          >
            <span className="mr-2">{typeIcons[toast.type]}</span>
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.2s ease-out; }
      `}</style>
    </ToastContext.Provider>
  );
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-status-safe-bg border-status-safe-border text-status-safe',
  error: 'bg-status-danger-bg border-status-danger-border text-status-danger',
  info: 'bg-surface border-line text-ink',
};

const typeIcons: Record<ToastType, string> = {
  success: '\u2713',
  error: '\u2716',
  info: '\u2139',
};

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
