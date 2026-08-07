'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="text-6xl font-black text-status-danger">!</div>
      <h1 className="mt-4 text-2xl font-black text-ink font-display">Something went wrong</h1>
      <p className="mt-2 max-w-md text-text-secondary">An unexpected error occurred. You can try again or return to the home page.</p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-moss px-6 py-3 font-bold text-white transition hover:bg-primary-hover focus-ring"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-full border border-line bg-surface px-6 py-3 font-bold text-moss transition hover:border-moss focus-ring"
        >
          Go home
        </a>
      </div>
    </main>
  );
}
