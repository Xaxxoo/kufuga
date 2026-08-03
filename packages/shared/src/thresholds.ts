export type BirdType = 'broiler' | 'layer';
export type AgeWeek = 1 | 2 | 3 | 4 | 5 | 6;

export interface TemperatureBand {
  minC: number;
  maxC: number;
}

export interface BirdThresholds {
  nh3Ppm: { warn: number; danger: number };
  temperatureC: Record<AgeWeek, TemperatureBand>;
  humidityPct: { min: number; max: number };
}

// Target house temperatures step down as birds mature. NH3 and humidity
// limits are shared because they are environmental safety limits.
export const thresholds: Record<BirdType, BirdThresholds> = {
  broiler: {
    nh3Ppm: { warn: 15, danger: 25 },
    temperatureC: {
      1: { minC: 32, maxC: 35 },
      2: { minC: 29, maxC: 32 },
      3: { minC: 26, maxC: 29 },
      4: { minC: 23, maxC: 26 },
      5: { minC: 21, maxC: 23 },
      6: { minC: 20, maxC: 22 },
    },
    humidityPct: { min: 45, max: 75 },
  },
  layer: {
    nh3Ppm: { warn: 15, danger: 25 },
    temperatureC: {
      1: { minC: 31, maxC: 34 },
      2: { minC: 28, maxC: 31 },
      3: { minC: 25, maxC: 28 },
      4: { minC: 22, maxC: 25 },
      5: { minC: 20, maxC: 23 },
      6: { minC: 19, maxC: 22 },
    },
    humidityPct: { min: 45, max: 75 },
  },
};

export const THRESHOLDS = thresholds;
