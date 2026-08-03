import { describe, expect, it } from 'vitest';
import { evaluateReading } from './evaluate.js';
import type { TelemetryReading } from './domain.js';

const reading: TelemetryReading = {
  deviceId: 'device-1',
  ts: 1_700_000_000,
  tempC: 40,
  humidityPct: 80,
  nh3Ppm: 30,
  alert: true,
};

describe('evaluateReading', () => {
  it('returns deterministic alerts for every exceeded danger threshold', () => {
    expect(evaluateReading(reading, 'broiler', 1)).toEqual([
      { id: 'device-1:1700000000:NH3_DANGER', deviceId: 'device-1', ts: 1700000000, kind: 'NH3_DANGER', value: 30, acknowledged: false },
      { id: 'device-1:1700000000:TEMP_HIGH', deviceId: 'device-1', ts: 1700000000, kind: 'TEMP_HIGH', value: 40, acknowledged: false },
      { id: 'device-1:1700000000:HUMIDITY_HIGH', deviceId: 'device-1', ts: 1700000000, kind: 'HUMIDITY_HIGH', value: 80, acknowledged: false },
    ]);
  });

  it('returns no alerts at threshold boundaries', () => {
    expect(evaluateReading({ ...reading, tempC: 32, humidityPct: 75, nh3Ppm: 24.999 }, 'broiler', 1)).toHaveLength(0);
  });
});
