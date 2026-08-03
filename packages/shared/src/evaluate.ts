import type { Alert, TelemetryReading } from './domain.js';
import { type AgeWeek, type BirdType, thresholds } from './thresholds.js';

export function evaluateReading(
  reading: TelemetryReading,
  birdType: BirdType,
  ageWeeks: AgeWeek,
): Alert[] {
  const config = thresholds[birdType];
  const temperature = config.temperatureC[ageWeeks];
  const alerts: Alert[] = [];
  const add = (kind: Alert['kind'], value: number): void => {
    alerts.push({
      id: `${reading.deviceId}:${reading.ts}:${kind}`,
      deviceId: reading.deviceId,
      ts: reading.ts,
      kind,
      value,
      acknowledged: false,
    });
  };

  if (reading.nh3Ppm >= config.nh3Ppm.danger) add('NH3_DANGER', reading.nh3Ppm);
  if (reading.tempC > temperature.maxC) add('TEMP_HIGH', reading.tempC);
  if (reading.tempC < temperature.minC) add('TEMP_LOW', reading.tempC);
  if (reading.humidityPct > config.humidityPct.max) {
    add('HUMIDITY_HIGH', reading.humidityPct);
  }

  return alerts;
}

