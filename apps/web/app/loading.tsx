export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg">
      <div className="space-y-4 w-full max-w-2xl px-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-border" />
        <div className="h-4 w-full animate-pulse rounded bg-border" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="h-24 animate-pulse rounded-xl bg-border" />
          <div className="h-24 animate-pulse rounded-xl bg-border" />
          <div className="h-24 animate-pulse rounded-xl bg-border" />
        </div>
        <div className="mt-4 h-64 animate-pulse rounded-xl bg-border" />
      </div>
    </main>
  );
}
