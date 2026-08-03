import { z } from 'zod';

export const sensorReadingSchema = z.object({
  nodeId: z.string(),
  farmId: z.string(),
  temperatureC: z.number(),
  humidityPercent: z.number().min(0).max(100),
  ammoniaPpm: z.number().min(0),
  recordedAt: z.coerce.date(),
});

export type SensorReading = z.infer<typeof sensorReadingSchema>;
export const supportedCountries = ['KE', 'GH'] as const;
