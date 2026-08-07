import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="text-8xl font-black text-text-muted font-display">404</div>
      <h1 className="mt-4 text-2xl font-black text-ink font-display">Page not found</h1>
      <p className="mt-2 max-w-md text-text-secondary">The page you are looking for does not exist or has been moved.</p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-moss px-6 py-3 font-bold text-white transition hover:bg-primary-hover focus-ring"
      >
        Back to home
      </Link>
    </main>
  );
}
