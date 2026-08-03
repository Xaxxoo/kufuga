import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { canonicalJson, hashReadings } from './canonical.js';
import type { TelemetryReading } from './domain.js';

const fixture: TelemetryReading[] = [
  { deviceId: 'b', ts: 2, tempC: 25.123456789, humidityPct: 60, nh3Ppm: 2.5, alert: false },
  { deviceId: 'a', ts: 1, tempC: 24.1, humidityPct: 55.5555555, nh3Ppm: 1, alert: false },
];

describe('canonical JSON', () => {
  it('sorts keys and fixes numeric precision', () => {
    expect(canonicalJson({ z: 1, a: 2.5, nested: { b: true, a: 'x' } })).toBe('{"a":2.500000,"nested":{"a":"x","b":true},"z":1.000000}');
  });

  it('matches the golden SHA-256 fixture', () => {
    const canonical = '[{"alert":false,"deviceId":"a","humidityPct":55.555556,"nh3Ppm":1.000000,"tempC":24.100000,"ts":1.000000},{"alert":false,"deviceId":"b","humidityPct":60.000000,"nh3Ppm":2.500000,"tempC":25.123457,"ts":2.000000}]';
    expect(canonicalJson([...fixture].sort((a, b) => `${a.deviceId}:${a.ts}`.localeCompare(`${b.deviceId}:${b.ts}`)))).toBe(canonical);
    expect(hashReadings(fixture)).toBe(createHash('sha256').update(canonical).digest('hex'));
    expect(hashReadings([...fixture].reverse())).toBe(hashReadings(fixture));
  });
});
