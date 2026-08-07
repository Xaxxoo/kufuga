import { useState } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, { Line, Polyline, Rect, Text as SvgText, Circle } from 'react-native-svg';
import type { Reading } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export function MetricChart({ readings, metric, minBand, maxBand, color }: { readings: Reading[]; metric: 'tempC' | 'humidityPct' | 'nh3Ppm'; minBand?: number; maxBand?: number; color: string }): React.JSX.Element {
  const theme = useTheme();
  const width = 330; const height = 190; const padLeft = 36; const padBottom = 22;
  const chartW = width - padLeft; const chartH = height - padBottom;
  const values = readings.map((r) => r[metric]);
  const min = Math.min(minBand ?? Math.min(...values, 0), ...values, 0);
  const max = Math.max(maxBand ?? Math.max(...values, 1), ...values, 1);
  const spread = max - min || 1;
  const y = (v: number) => chartH - ((v - min) / spread) * (chartH - 10) - 5;
  const x = (i: number) => padLeft + (i / Math.max(values.length - 1, 1)) * chartW;

  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');

  const [touchIdx, setTouchIdx] = useState<number | null>(null);
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (_, gs) => {
      const ratio = Math.max(0, Math.min(1, (gs.x0 - padLeft) / chartW));
      setTouchIdx(Math.round(ratio * (values.length - 1)));
    },
    onPanResponderMove: (_, gs) => {
      const ratio = Math.max(0, Math.min(1, (gs.moveX - padLeft) / chartW));
      setTouchIdx(Math.round(ratio * (values.length - 1)));
    },
    onPanResponderRelease: () => setTouchIdx(null),
  });

  const midVal = Math.round((max + min) / 2);
  const firstTs = readings.length > 0 ? readings[0].ts : 0;
  const lastTs = readings.length > 0 ? readings[readings.length - 1].ts : 0;
  const fmtTime = (ts: number) => new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const safeBandFill = theme.status('safe').bg;
  const labelColor = theme.colors.textSecondary;
  const axisColor = theme.colors.border;
  const gridColor = theme.colors.borderSubtle;

  return (
    <View {...panResponder.panHandlers} accessible accessibilityLabel={`${metric} chart showing ${values.length} readings`}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {minBand !== undefined && maxBand !== undefined && (
          <>
            <Rect x={padLeft} y={y(maxBand)} width={chartW} height={Math.max(0, y(minBand) - y(maxBand))} fill={safeBandFill} opacity="0.5" />
            <SvgText x={padLeft + 4} y={y(maxBand) + 12} fill={labelColor} fontSize="9" opacity="0.8">Safe range</SvgText>
          </>
        )}
        <Line x1={padLeft} y1={chartH} x2={width} y2={chartH} stroke={axisColor} />
        <Line x1={padLeft} y1={y(midVal)} x2={width} y2={y(midVal)} stroke={gridColor} strokeDasharray="4,4" />
        {values.length > 0 && <Polyline points={points} fill="none" stroke={color} strokeWidth="2.5" />}
        {/* Y-axis labels */}
        <SvgText x={padLeft - 4} y={12} fill={labelColor} fontSize="10" textAnchor="end">{max.toFixed(0)}</SvgText>
        <SvgText x={padLeft - 4} y={y(midVal) + 4} fill={labelColor} fontSize="10" textAnchor="end">{midVal}</SvgText>
        <SvgText x={padLeft - 4} y={chartH - 2} fill={labelColor} fontSize="10" textAnchor="end">{min.toFixed(0)}</SvgText>
        {/* X-axis time labels */}
        {firstTs > 0 && <SvgText x={padLeft} y={height - 4} fill={labelColor} fontSize="9">{fmtTime(firstTs)}</SvgText>}
        {lastTs > 0 && <SvgText x={width - 2} y={height - 4} fill={labelColor} fontSize="9" textAnchor="end">{fmtTime(lastTs)}</SvgText>}
        {/* Touch tooltip */}
        {touchIdx !== null && touchIdx >= 0 && touchIdx < values.length && (
          <>
            <Line x1={x(touchIdx)} y1={0} x2={x(touchIdx)} y2={chartH} stroke={color} strokeWidth="1" strokeDasharray="3,3" />
            <Circle cx={x(touchIdx)} cy={y(values[touchIdx])} r={4} fill={color} />
            <SvgText x={x(touchIdx)} y={y(values[touchIdx]) - 8} fill={color} fontSize="11" fontWeight="700" textAnchor="middle">{values[touchIdx].toFixed(1)}</SvgText>
          </>
        )}
      </Svg>
    </View>
  );
}
