import Svg, { Defs, LinearGradient, Polyline, Polygon, Stop } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

export function Sparkline({ values, color, height = 44 }: { values: number[]; color?: string; height?: number }): React.JSX.Element {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;
  const width = 180;

  const trend = values.length >= 2
    ? values[values.length - 1] >= values[0] ? 'rising' : 'falling'
    : 'stable';

  if (!values.length) return <Svg width={width} height={height} accessible accessibilityLabel="No data available" />;
  const min = Math.min(...values); const max = Math.max(...values); const spread = max - min || 1;
  const coords = values.map((value, index) => ({
    x: (index / Math.max(values.length - 1, 1)) * width,
    y: height - ((value - min) / spread) * (height - 6) - 3,
  }));
  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const fillPoints = `0,${height} ${linePoints} ${width},${height}`;
  return (
    <Svg width={width} height={height} accessible accessibilityLabel={`Sparkline trend: ${trend} over ${values.length} points`}>
      <Defs>
        <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={resolvedColor} stopOpacity="0.15" />
          <Stop offset="1" stopColor={resolvedColor} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Polygon points={fillPoints} fill="url(#sparkFill)" />
      <Polyline points={linePoints} fill="none" stroke={resolvedColor} strokeWidth="2" />
    </Svg>
  );
}
