import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }): React.JSX.Element {
  const theme = useTheme();
  const danger = theme.status('danger');
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={[styles.icon, { color: danger.fg }]}>!</Text>
      <Text style={[styles.message, { color: theme.colors.text }]}>{message ?? 'Something went wrong'}</Text>
      {onRetry && (
        <Pressable
          style={[styles.retry, { borderColor: theme.colors.primary }]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={[styles.retryText, { color: theme.colors.primary }]}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 48 },
  icon: { fontSize: 40, fontWeight: '900', marginBottom: 10 },
  message: { fontSize: 16, marginBottom: 16, textAlign: 'center' },
  retry: { borderRadius: 8, borderWidth: 1.5, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { fontSize: 15, fontWeight: '600' },
});
