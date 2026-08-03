import Svg, { Polyline } from 'react-native-svg';

export function Sparkline({ values, color = '#176b4d', height = 44 }: { values: number[]; color?: string; height?: number }): React.JSX.Element {
  const width = 180;
  if (!values.length) return <Svg width={width} height={height} />;
  const min = Math.min(...values); const max = Math.max(...values); const spread = max - min || 1;
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * width},${height - ((value - min) / spread) * (height - 6) - 3}`).join(' ');
  return <Svg width={width} height={height}><Polyline points={points} fill="none" stroke={color} strokeWidth="2" /></Svg>;
}
