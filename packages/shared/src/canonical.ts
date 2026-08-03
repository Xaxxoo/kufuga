import { createHash } from 'node:crypto';
import type { TelemetryReading } from './domain.js';

export const CANONICAL_DECIMAL_PRECISION = 6;

function serialize(value: unknown, precision: number): string {
  if (value === null) return 'null';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Canonical JSON cannot contain non-finite numbers');
    if (Object.is(value, -0)) return '0';
    const factor = 10 ** precision;
    const rounded = Math.round((value + Number.EPSILON) * factor) / factor;
    return rounded.toFixed(precision);
  }
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => serialize(item, precision)).join(',')}]`;
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${serialize(item, precision)}`).join(',')}}`;
  }
  throw new TypeError(`Unsupported canonical JSON value: ${typeof value}`);
}

export function canonicalJson(value: unknown, precision = CANONICAL_DECIMAL_PRECISION): string {
  return serialize(value, precision);
}

export function hashReadings(readings: readonly TelemetryReading[]): string {
  const ordered = [...readings].sort((a, b) =>
    `${a.deviceId}:${a.ts}`.localeCompare(`${b.deviceId}:${b.ts}`),
  );
  return createHash('sha256').update(canonicalJson(ordered)).digest('hex');
}
