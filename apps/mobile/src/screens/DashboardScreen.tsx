import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getReadings, type Device, type Reading } from '../api/client';
import { useDevices, useLatest, useFarm } from '../api/hooks';
import { Sparkline } from '../components/Sparkline';
import { StatusBadge } from '../components/StatusBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { OfflineBanner } from '../components/OfflineBanner';
import { useSessionStore } from '../state/session';
import { useSettingsStore } from '../state/settings';
import { useTheme } from '../context/ThemeContext';
import { thresholds, type AgeWeek } from '@kufuga/shared/thresholds';
import { formatTemp, formatHumidity, formatPpm } from '@kufuga/ui/format';
import { useQuery } from '@tanstack/react-query';

type StatusLevel = 'safe' | 'warn' | 'danger';

function HouseCard({ device, token, birdType, ageWeeks, onPress }: { device: Device; token: string; birdType: 'broiler' | 'layer'; ageWeeks: AgeWeek; onPress: () => void }): React.JSX.Element {
  const theme = useTheme();
  const latest = useLatest(token, device.id);
  const readings = useQuery({ queryKey: ['dashboard-readings', device.id], queryFn: () => getReadings(token, device.id, '24h', 'hour') });
  const reading = latest.data;
  const config = thresholds[birdType];

  const status: StatusLevel = !reading ? 'warn' : reading.alert || reading.nh3Ppm >= config.nh3Ppm.danger ? 'danger' : reading.nh3Ppm >= config.nh3Ppm.warn || reading.tempC < config.temperatureC[ageWeeks].minC || reading.tempC > config.temperatureC[ageWeeks].maxC || reading.humidityPct > config.humidityPct.max ? 'warn' : 'safe';
  const offline = Boolean(reading && Date.now() / 1000 - reading.ts > 1800);
  const statusColors = theme.status(status);

  const a11yLabel = reading
    ? `${device.label}, temperature ${formatTemp(reading.tempC)}, humidity ${formatHumidity(reading.humidityPct)}, ammonia ${formatPpm(reading.nh3Ppm)}, status ${status}`
    : `${device.label}, loading`;

  return (
    <Pressable
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderLeftColor: statusColors.border, borderLeftWidth: 4 }]}
      onPress={onPress}
      accessibilityLabel={a11yLabel}
      accessibilityRole="button"
      android_ripple={{ color: theme.colors.surfaceHover }}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.house, { color: theme.colors.text, fontFamily: theme.font.display }]}>{device.label}</Text>
        <StatusBadge level={status} />
      </View>
      {offline && <OfflineBanner lastUpdated={reading?.ts} />}
      {reading ? (
        <>
          <View style={styles.metrics}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>{formatTemp(reading.tempC)}</Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Temp</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>{formatHumidity(reading.humidityPct)}</Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Humidity</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>{formatPpm(reading.nh3Ppm)}</Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>NH{'\u2083'}</Text>
            </View>
          </View>
          <Sparkline values={(readings.data ?? []).map((item: Reading) => item.tempC)} color={theme.colors.primary} />
        </>
      ) : (
        <SkeletonLoader variant="row" />
      )}
    </Pressable>
  );
}

export function DashboardScreen(): React.JSX.Element {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const token = useSessionStore((state) => state.accessToken);
  const farmId = useSessionStore((state) => state.user?.farmId ?? null);
  const settings = useSettingsStore();
  const devices = useDevices(token, farmId);
  const farm = useFarm(token, farmId);
  const title = useMemo(() => farm.data ? `${farm.data.ownerName}'s farm` : 'Farm dashboard', [farm.data]);

  if (!token) return <ErrorState message="Not signed in" />;

  if (devices.isLoading) {
    return (
      <View style={[styles.page, { backgroundColor: theme.colors.bg }]}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.font.display }]}>{title}</Text>
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="card" />
      </View>
    );
  }

  if (devices.isError) {
    return (
      <View style={[styles.page, { backgroundColor: theme.colors.bg }]}>
        <ErrorState message="Could not load devices" onRetry={() => void devices.refetch()} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: theme.colors.bg }]}
      refreshControl={<RefreshControl refreshing={devices.isRefetching} onRefresh={() => void devices.refetch()} tintColor={theme.colors.primary} />}
    >
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.font.display }]}>{title}</Text>
      <Text style={[styles.caption, { color: theme.colors.textSecondary }]}>{devices.data?.length ?? 0} monitored houses</Text>
      {(devices.data ?? []).length === 0 ? (
        <EmptyState icon={'\uD83C\uDFE0'} title="No houses monitored yet" subtitle="Add a device from the admin console to start monitoring." />
      ) : (
        (devices.data ?? []).map((device) => (
          <HouseCard key={device.id} device={device} token={token} birdType={settings.birdType} ageWeeks={settings.ageWeeks} onPress={() => navigation.navigate('DeviceDetail', { deviceId: device.id, label: device.label })} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  caption: { fontSize: 15, marginBottom: 16 },
  card: { borderRadius: 14, borderWidth: 1, marginBottom: 12, minHeight: 44, padding: 16 },
  cardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  house: { fontSize: 20, fontWeight: '700' },
  metrics: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metricItem: { alignItems: 'center' },
  metricValue: { fontSize: 22, fontWeight: '700' },
  metricLabel: { fontSize: 12, marginTop: 2 },
});
