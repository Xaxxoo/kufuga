import { cn } from '../lib/utils';

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('rounded-lg bg-moss px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2', className)} {...props} />;
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none ring-moss focus:ring-2 focus-visible:ring-moss dark:placeholder:text-text-muted', className)} {...props} />;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <section className={cn('rounded-xl border border-line bg-surface p-5 shadow-sm', className)} {...props} />;
}

export function Badge({ children, tone = 'neutral', muted = false }: { children: React.ReactNode; tone?: 'green' | 'amber' | 'red' | 'neutral'; muted?: boolean }) {
  const colors = muted
    ? { green: 'bg-status-safe-muted-bg text-status-safe-muted', amber: 'bg-status-warn-muted-bg text-status-warn-muted', red: 'bg-status-danger-muted-bg text-status-danger-muted', neutral: 'bg-surface-hover text-text-secondary' }
    : { green: 'bg-status-safe-bg text-status-safe', amber: 'bg-status-warn-bg text-status-warn', red: 'bg-status-danger-bg text-status-danger', neutral: 'bg-surface-hover text-text-secondary' };
  return <span className={cn('inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold', colors[tone])}>{children}</span>;
}

export function Table({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm">{children}</table></div>;
}
