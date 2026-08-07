import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {icon && <Text style={[styles.icon, { color: theme.colors.textMuted }]} accessibilityElementsHidden>{icon}</Text>}
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.font.display }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Pressable
          style={[styles.action, { backgroundColor: theme.colors.primary }]}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={[styles.actionText, { color: theme.colors.primaryText }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 48 },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 16, textAlign: 'center' },
  action: { borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12 },
  actionText: { fontSize: 15, fontWeight: '600' },
});
