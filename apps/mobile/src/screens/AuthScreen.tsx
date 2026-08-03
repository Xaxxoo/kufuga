import { useState } from 'react';
import { Alert, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { login, register } from '../api/client';
import { useSessionStore } from '../state/session';

export function AuthScreen(): React.JSX.Element {
  const setSession = useSessionStore((state) => state.setSession); const [isRegister, setRegister] = useState(false); const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ ownerName: '', phone: '', pin: '', region: 'Nairobi', flockSize: '100', birdType: 'broiler' as 'broiler' | 'layer' });
  const submit = async () => { setBusy(true); try { const result = isRegister ? await register({ ...form, flockSize: Number(form.flockSize) }) : await login(form.phone, form.pin); setSession(result); } catch (error) { Alert.alert('Could not sign in', error instanceof Error ? error.message : 'Please try again.'); } finally { setBusy(false); } };
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.page}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.logo}>Kufuga</Text><Text style={styles.subtitle}>Poultry health, clearly monitored.</Text>
    {isRegister && <><TextInput style={styles.input} placeholder="Owner name" value={form.ownerName} onChangeText={(ownerName) => setForm({ ...form, ownerName })} /><TextInput style={styles.input} placeholder="Region" value={form.region} onChangeText={(region) => setForm({ ...form, region })} /><TextInput style={styles.input} placeholder="Flock size" keyboardType="number-pad" value={form.flockSize} onChangeText={(flockSize) => setForm({ ...form, flockSize })} /><View style={styles.choice}><Button title={`Bird type: ${form.birdType}`} onPress={() => setForm({ ...form, birdType: form.birdType === 'broiler' ? 'layer' : 'broiler' })} /></View></>}
    <TextInput style={styles.input} placeholder="Phone e.g. +254700000000" keyboardType="phone-pad" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} /><TextInput style={styles.input} placeholder="PIN" secureTextEntry keyboardType="number-pad" value={form.pin} onChangeText={(pin) => setForm({ ...form, pin })} /><Button title={busy ? 'Please wait…' : isRegister ? 'Create farm account' : 'Log in'} disabled={busy} onPress={() => void submit()} /><View style={styles.switch}><Button title={isRegister ? 'I already have an account' : 'Register a new farm'} onPress={() => setRegister(!isRegister)} /></View>
  </ScrollView></KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: '#f6faf8' }, content: { flexGrow: 1, justifyContent: 'center', padding: 24 }, logo: { color: '#176b4d', fontSize: 42, fontWeight: '800', marginBottom: 6 }, subtitle: { color: '#52635b', fontSize: 17, marginBottom: 28 }, input: { backgroundColor: '#fff', borderColor: '#d5e2db', borderRadius: 10, borderWidth: 1, fontSize: 17, marginBottom: 12, padding: 14 }, choice: { alignSelf: 'flex-start', marginBottom: 14 }, switch: { marginTop: 18 } });
