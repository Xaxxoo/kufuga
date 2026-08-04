import { z } from 'zod';

const unixTimestamp = z.number().int().nonnegative();
const isoTimestamp = z.string().datetime({ offset: true });
export const countryCodeSchema = z.enum(['KE', 'GH', 'NG', 'ET', 'RW']);
export type CountryCode = z.infer<typeof countryCodeSchema>;

export const telemetryReadingSchema = z.object({
  deviceId: z.string().min(1),
  ts: unixTimestamp,
  tempC: z.number().finite(),
  humidityPct: z.number().finite().min(0).max(100),
  nh3Ppm: z.number().finite().min(0),
  alert: z.boolean(),
});
export type TelemetryReading = z.infer<typeof telemetryReadingSchema>;

export const deviceSchema = z.object({
  id: z.string().min(1),
  farmId: z.string().min(1),
  label: z.string().min(1),
  simNumber: z.string().min(1),
  country: countryCodeSchema,
  calibrationR0: z.number().finite().nonnegative(),
  createdAt: isoTimestamp,
});
export type Device = z.infer<typeof deviceSchema>;

export const farmSchema = z.object({
  id: z.string().min(1),
  ownerName: z.string().min(1),
  phone: z.string().min(1),
  region: z.string().min(1),
  flockSize: z.number().int().nonnegative(),
  birdType: z.enum(['broiler', 'layer']),
});
export type Farm = z.infer<typeof farmSchema>;

export const alertKindSchema = z.enum([
  'NH3_DANGER',
  'TEMP_HIGH',
  'TEMP_LOW',
  'HUMIDITY_HIGH',
  'DEVICE_OFFLINE',
]);
export type AlertKind = z.infer<typeof alertKindSchema>;

export const alertSchema = z.object({
  id: z.string().min(1),
  deviceId: z.string().min(1),
  ts: unixTimestamp,
  kind: alertKindSchema,
  value: z.number().finite(),
  acknowledged: z.boolean(),
});
export type Alert = z.infer<typeof alertSchema>;

export const anchorBatchSchema = z.object({
  id: z.string().min(1),
  deviceId: z.string().min(1),
  periodStart: unixTimestamp,
  periodEnd: unixTimestamp,
  readingCount: z.number().int().nonnegative(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  stellarTxHash: z.string().min(1),
  ledger: z.string().min(1),
  anchoredAt: isoTimestamp,
});
export type AnchorBatch = z.infer<typeof anchorBatchSchema>;

export const sensorReadingSchema = telemetryReadingSchema;
export type SensorReading = TelemetryReading;
