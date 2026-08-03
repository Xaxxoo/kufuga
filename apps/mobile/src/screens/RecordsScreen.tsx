import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDevices, useAnchors, useVerifyAnchor } from '../api/hooks';
import { useSessionStore } from '../state/session';
import type { AnchorBatch, Device } from '../api/client';

function AnchorRow({ token, device, batch }: { token: string; device: Device; batch: AnchorBatch }): React.JSX.Element {
  const verification = useVerifyAnchor(token, device.id, batch.id); const txUrl = verification.data?.txUrl ?? `https://stellar.expert/explorer/testnet/tx/${batch.stellarTxHash}`;
  return <TouchableOpacity style={styles.batch} onPress={() => void Linking.openURL(txUrl)}><View style={{ flex: 1 }}><Text style={styles.batchTitle}>{device.label} · {new Date(batch.periodStart * 1000).toLocaleString()}</Text><Text style={styles.muted}>{batch.readingCount} readings · ledger {batch.ledger}</Text></View><Text style={verification.data?.verified ? styles.verified : styles.pending}>{verification.isLoading ? 'Checking…' : verification.data?.verified ? '✓ Verified on Stellar' : 'Verify'}</Text></TouchableOpacity>;
}

function DeviceRecords({ token, device }: { token: string; device: Device }): React.JSX.Element { const anchors = useAnchors(token, device.id); return <>{(anchors.data ?? []).map((batch) => <AnchorRow key={batch.id} token={token} device={device} batch={batch} />)}</>; }

export function RecordsScreen(): React.JSX.Element {
  const token = useSessionStore((state) => state.accessToken); const farmId = useSessionStore((state) => state.user?.farmId ?? null); const devices = useDevices(token, farmId);
  return <ScrollView style={styles.page}><Text style={styles.title}>Trusted records</Text><Text style={styles.explainer}>Each hour, Kufuga makes a fingerprint of your readings and records it on Stellar. A green check means the readings in this app still match that public record. This helps lenders and insurers trust your farm history.</Text>{(devices.data ?? []).map((device) => <DeviceRecords key={device.id} token={token!} device={device} />)}</ScrollView>;
}
const styles = StyleSheet.create({ page: { backgroundColor: '#f6faf8', flex: 1, padding: 16 }, title: { color: '#173b2d', fontSize: 28, fontWeight: '800', marginBottom: 10 }, explainer: { backgroundColor: '#e5f3eb', borderRadius: 12, color: '#27533f', fontSize: 16, lineHeight: 24, marginBottom: 16, padding: 15 }, batch: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#dce9e2', borderRadius: 12, borderWidth: 1, flexDirection: 'row', marginBottom: 10, padding: 14 }, batchTitle: { color: '#173b2d', fontWeight: '700' }, muted: { color: '#6b7d74', marginTop: 4 }, verified: { color: '#198754', fontSize: 12, fontWeight: '800', maxWidth: 100, textAlign: 'right' }, pending: { color: '#b7791f', fontSize: 12, fontWeight: '700' } });
