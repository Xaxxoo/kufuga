import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getReadings, type Device, type Reading } from '../api/client';
import { useDevices, useLatest, useFarm } from '../api/hooks';
import { Sparkline } from '../components/Sparkline';
import { StatusDot, type Status } from '../components/StatusDot';
import { useSessionStore } from '../state/session';
import { useSettingsStore } from '../state/settings';
import { thresholds, type AgeWeek } from '@kufuga/shared/thresholds';
import { useQuery } from '@tanstack/react-query';

function HouseCard({ device, token, birdType, ageWeeks, onPress }: { device: Device; token: string; birdType: 'broiler' | 'layer'; ageWeeks: AgeWeek; onPress: () => void }): React.JSX.Element {
  const latest = useLatest(token, device.id); const readings = useQuery({ queryKey: ['dashboard-readings', device.id], queryFn: () => getReadings(token, device.id, '24h', 'hour') }); const reading = latest.data; const config = thresholds[birdType];
  const status: Status = !reading ? 'amber' : reading.alert || reading.nh3Ppm >= config.nh3Ppm.danger ? 'red' : reading.nh3Ppm >= config.nh3Ppm.warn || reading.tempC < config.temperatureC[ageWeeks].minC || reading.tempC > config.temperatureC[ageWeeks].maxC || reading.humidityPct > config.humidityPct.max ? 'amber' : 'green';
  const offline = Boolean(reading && Date.now() / 1000 - reading.ts > 1800);
  return <Pressable style={styles.card} onPress={onPress}><View style={styles.cardTitle}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><StatusDot status={status} /><Text style={styles.house}>{device.label}</Text></View>{offline && <Text style={styles.offline}>OFFLINE</Text>}</View>{reading ? <><View style={styles.metrics}><Text>Temp <Text style={styles.value}>{reading.tempC.toFixed(1)}°C</Text></Text><Text>Humidity <Text style={styles.value}>{reading.humidityPct.toFixed(0)}%</Text></Text><Text>NH3 <Text style={styles.value}>{reading.nh3Ppm.toFixed(0)}ppm</Text></Text></View><Sparkline values={(readings.data ?? []).map((item: Reading) => item.tempC)} /></> : <ActivityIndicator />}</Pressable>;
}

export function DashboardScreen(): React.JSX.Element {
  const navigation = useNavigation<any>(); const token = useSessionStore((state) => state.accessToken); const farmId = useSessionStore((state) => state.user?.farmId ?? null); const settings = useSettingsStore(); const devices = useDevices(token, farmId); const farm = useFarm(token, farmId);
  const title = useMemo(() => farm.data ? `${farm.data.ownerName}'s farm` : 'Farm dashboard', [farm.data]);
  if (!token || devices.isLoading) return <View style={styles.center}><ActivityIndicator /><Text>Loading farm…</Text></View>;
  return <ScrollView style={styles.page} refreshControl={<RefreshControl refreshing={devices.isRefetching} onRefresh={() => void devices.refetch()} />}><Text style={styles.title}>{title}</Text><Text style={styles.caption}>{devices.data?.length ?? 0} monitored houses · tap a card for detail</Text>{(devices.data ?? []).map((device) => <HouseCard key={device.id} device={device} token={token} birdType={settings.birdType} ageWeeks={settings.ageWeeks} onPress={() => navigation.navigate('DeviceDetail', { deviceId: device.id, label: device.label })} />)}</ScrollView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: '#f6faf8', padding: 16 }, center: { alignItems: 'center', flex: 1, justifyContent: 'center', gap: 10 }, title: { color: '#173b2d', fontSize: 28, fontWeight: '800', marginBottom: 4 }, caption: { color: '#61756b', fontSize: 15, marginBottom: 16 }, card: { backgroundColor: '#fff', borderColor: '#dce9e2', borderRadius: 14, borderWidth: 1, marginBottom: 12, padding: 16 }, cardTitle: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, house: { color: '#173b2d', fontSize: 20, fontWeight: '700' }, offline: { color: '#c53030', fontSize: 12, fontWeight: '800' }, metrics: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 13 }, value: { color: '#173b2d', fontWeight: '700' } });
