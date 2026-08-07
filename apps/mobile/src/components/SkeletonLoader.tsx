import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

function Pulse({ style }: { style: any }): React.JSX.Element {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);
  return <Animated.View style={[style, { opacity }]} />;
}

export function SkeletonLoader({ variant = 'card' }: { variant?: 'card' | 'chart' | 'row' }): React.JSX.Element {
  const theme = useTheme();
  const bg = theme.colors.border;

  if (variant === 'row') {
    return (
      <View style={styles.row} accessibilityRole="progressbar" accessibilityLabel="Loading">
        <Pulse style={[styles.rowLine, { backgroundColor: bg }]} />
        <Pulse style={[styles.rowLineShort, { backgroundColor: bg }]} />
      </View>
    );
  }

  if (variant === 'chart') {
    return (
      <View style={styles.chartBox} accessibilityRole="progressbar" accessibilityLabel="Loading">
        <Pulse style={[styles.chartBar, { backgroundColor: bg }]} />
      </View>
    );
  }

  return (
    <View style={[styles.card, { borderColor: theme.colors.border }]} accessibilityRole="progressbar" accessibilityLabel="Loading">
      <Pulse style={[styles.cardTitle, { backgroundColor: bg }]} />
      <View style={styles.cardMetrics}>
        <Pulse style={[styles.cardMetric, { backgroundColor: bg }]} />
        <Pulse style={[styles.cardMetric, { backgroundColor: bg }]} />
        <Pulse style={[styles.cardMetric, { backgroundColor: bg }]} />
      </View>
      <Pulse style={[styles.cardSparkline, { backgroundColor: bg }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'transparent', borderRadius: 14, borderWidth: 1, marginBottom: 12, padding: 16 },
  cardTitle: { borderRadius: 4, height: 20, width: 120 },
  cardMetrics: { flexDirection: 'row', gap: 12, marginTop: 14 },
  cardMetric: { borderRadius: 4, height: 16, width: 70 },
  cardSparkline: { borderRadius: 4, height: 44, marginTop: 12, width: '100%' },
  chartBox: { marginTop: 10 },
  chartBar: { borderRadius: 8, height: 190, width: '100%' },
  row: { gap: 6, marginBottom: 10, padding: 14 },
  rowLine: { borderRadius: 4, height: 14, width: '80%' },
  rowLineShort: { borderRadius: 4, height: 14, width: '50%' },
});
