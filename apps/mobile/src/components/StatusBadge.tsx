import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type StatusLevel = 'safe' | 'warn' | 'danger';

const statusIcons: Record<StatusLevel, string> = { safe: '\u2713', warn: '\u26A0', danger: '\u2716' };
const statusLabels: Record<StatusLevel, string> = { safe: 'Normal', warn: 'Warning', danger: 'Danger' };

export function StatusBadge({ level, label }: { level: StatusLevel; label?: string }): React.JSX.Element {
  const theme = useTheme();
  const s = theme.status(level);
  const displayLabel = label ?? statusLabels[level];
  return (
    <View
      style={[styles.badge, { backgroundColor: s.bg, borderLeftColor: s.border }]}
      accessibilityRole="summary"
      accessibilityLabel={`Status: ${displayLabel}`}
    >
      <Text style={[styles.icon, { color: s.fg }]}>{statusIcons[level]}</Text>
      <Text style={[styles.label, { color: s.fg }]}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', borderLeftWidth: 3, borderRadius: 6, flexDirection: 'row', gap: 4, paddingHorizontal: 8, paddingVertical: 4 },
  icon: { fontSize: 12, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '600' },
});
