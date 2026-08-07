/* ── Shared formatters ─────────────────────────────────────────────── */

/** Format temperature with unit: "28.4°C" */
export function formatTemp(tempC: number): string {
  return `${tempC.toFixed(1)}\u00B0C`;
}

/** Format humidity percentage: "63%" */
export function formatHumidity(pct: number): string {
  return `${Math.round(pct)}%`;
}

/** Format NH3 in ppm: "18 ppm" */
export function formatPpm(ppm: number): string {
  return `${Math.round(ppm)} ppm`;
}

/** Format a unix timestamp as relative time: "2 min ago", "1 hr ago", "3 days ago" */
export function formatRelativeTime(unixSeconds: number): string {
  const diffSeconds = Math.floor(Date.now() / 1000 - unixSeconds);
  if (diffSeconds < 60) return 'just now';
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

/** Format a unix timestamp as short date: "4 Aug 2026" */
export function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Format a unix timestamp as date + time: "4 Aug 2026, 14:30" */
export function formatDateTime(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format a decimal as percentage: "94.2%" */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
