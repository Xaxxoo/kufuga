import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { login, register } from '../api/client';
import { useSessionStore } from '../state/session';
import { useTheme } from '../context/ThemeContext';

export function AuthScreen(): React.JSX.Element {
  const theme = useTheme();
  const setSession = useSessionStore((state) => state.setSession);
  const [isRegister, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ ownerName: '', phone: '', pin: '', region: 'Nairobi', flockSize: '100', birdType: 'broiler' as 'broiler' | 'layer' });

  const submit = async () => {
    setBusy(true);
    try {
      const result = isRegister ? await register({ ...form, flockSize: Number(form.flockSize) }) : await login(form.phone, form.pin);
      setSession(result);
    } catch (error) {
      Alert.alert('Could not sign in', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.page, { backgroundColor: theme.colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.logo, { color: theme.colors.primary, fontFamily: theme.font.display }]}>Kufuga</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Poultry health, clearly monitored.</Text>

        {isRegister && (
          <>
            <TextInput style={inputStyle} placeholder="Owner name" placeholderTextColor={theme.colors.textMuted} value={form.ownerName} onChangeText={(ownerName) => setForm({ ...form, ownerName })} />
            <TextInput style={inputStyle} placeholder="Region" placeholderTextColor={theme.colors.textMuted} value={form.region} onChangeText={(region) => setForm({ ...form, region })} />
            <TextInput style={inputStyle} placeholder="Flock size" placeholderTextColor={theme.colors.textMuted} keyboardType="number-pad" value={form.flockSize} onChangeText={(flockSize) => setForm({ ...form, flockSize })} />
            <View style={styles.birdTypeRow}>
              {(['broiler', 'layer'] as const).map((type) => (
                <Pressable
                  key={type}
                  style={[styles.birdTypeChip, { borderColor: theme.colors.border }, form.birdType === type && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                  onPress={() => setForm({ ...form, birdType: type })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: form.birdType === type }}
                >
                  <Text style={{ color: form.birdType === type ? theme.colors.primaryText : theme.colors.text, fontWeight: '600' }}>{type}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <TextInput style={inputStyle} placeholder="Phone e.g. +254700000000" placeholderTextColor={theme.colors.textMuted} keyboardType="phone-pad" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} />
        <TextInput style={inputStyle} placeholder="PIN" placeholderTextColor={theme.colors.textMuted} secureTextEntry keyboardType="number-pad" value={form.pin} onChangeText={(pin) => setForm({ ...form, pin })} />

        <Pressable
          style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => void submit()}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={isRegister ? 'Create farm account' : 'Log in'}
        >
          {busy ? (
            <ActivityIndicator color={theme.colors.primaryText} />
          ) : (
            <Text style={[styles.primaryButtonText, { color: theme.colors.primaryText }]}>{isRegister ? 'Create farm account' : 'Log in'}</Text>
          )}
        </Pressable>

        <Pressable
          style={[styles.toggleButton, { borderColor: theme.colors.border }]}
          onPress={() => setRegister(!isRegister)}
          accessibilityRole="button"
        >
          <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 15 }}>{isRegister ? 'I already have an account' : 'Register a new farm'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 42, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 17, marginBottom: 28 },
  input: { borderRadius: 10, borderWidth: 1, fontSize: 17, marginBottom: 12, minHeight: 48, padding: 14 },
  birdTypeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  birdTypeChip: { borderRadius: 10, borderWidth: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 10 },
  primaryButton: { alignItems: 'center', borderRadius: 10, justifyContent: 'center', marginTop: 4, minHeight: 48, paddingVertical: 14 },
  primaryButtonText: { fontSize: 17, fontWeight: '700' },
  toggleButton: { alignItems: 'center', borderRadius: 10, borderWidth: 1.5, marginTop: 16, minHeight: 48, justifyContent: 'center', paddingVertical: 12 },
});
