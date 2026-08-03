import Svg, { Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import type { Reading } from '../api/client';

export function MetricChart({ readings, metric, minBand, maxBand, color }: { readings: Reading[]; metric: 'tempC' | 'humidityPct' | 'nh3Ppm'; minBand?: number; maxBand?: number; color: string }): React.JSX.Element {
  const width = 330; const height = 190; const values = readings.map((reading) => reading[metric]);
  const min = Math.min(minBand ?? Math.min(...values, 0), ...values, 0); const max = Math.max(maxBand ?? Math.max(...values, 1), ...values, 1); const spread = max - min || 1;
  const y = (value: number) => height - ((value - min) / spread) * (height - 20) - 10;
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * width},${y(value)}`).join(' ');
  return <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
    {minBand !== undefined && maxBand !== undefined && <Rect x="0" y={y(maxBand)} width={width} height={Math.max(0, y(minBand) - y(maxBand))} fill="#d9f0e4" opacity="0.7" />}
    <Line x1="0" y1={height - 10} x2={width} y2={height - 10} stroke="#d9d9d9" />
    {values.length > 0 && <Polyline points={points} fill="none" stroke={color} strokeWidth="3" />}
    <SvgText x="4" y="15" fill="#6b7280" fontSize="11">{max.toFixed(0)}</SvgText>
    <SvgText x="4" y={height - 14} fill="#6b7280" fontSize="11">{min.toFixed(0)}</SvgText>
  </Svg>;
}
