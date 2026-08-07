import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatRelativeTime } from '@kufuga/ui/format';

export function OfflineBanner({ lastUpdated }: { lastUpdated?: number }): React.JSX.Element {
  const theme = useTheme();
  const warn = theme.status('warn');
  return (
    <View style={[styles.banner, { backgroundColor: warn.bg }]} accessibilityRole="alert">
      <Text style={[styles.text, { color: warn.fg }]}>
        Offline{lastUpdated ? ` \u00b7 last updated ${formatRelativeTime(lastUpdated)}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 8, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 10 },
  text: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
