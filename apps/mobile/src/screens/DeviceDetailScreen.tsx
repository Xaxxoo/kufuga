import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAcknowledgeAlert, useAlerts, useReadings } from '../api/hooks';
import { MetricChart } from '../components/MetricChart';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorState } from '../components/ErrorState';
import { useSessionStore } from '../state/session';
import { useSettingsStore } from '../state/settings';
import { useTheme } from '../context/ThemeContext';
import { thresholds, type AgeWeek } from '@kufuga/shared/thresholds';
import { formatDateTime } from '@kufuga/ui/format';

export function DeviceDetailScreen(): React.JSX.Element {
  const theme = useTheme();
  const route = useRoute<any>();
  const token = useSessionStore((state) => state.accessToken);
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');
  const settings = useSettingsStore();
  const readings = useReadings(token, route.params.deviceId, range, range === '24h' ? 'hour' : 'day');
  const alerts = useAlerts(token, Math.floor(Date.now() / 1000) - 30 * 86400);
  const acknowledge = useAcknowledgeAlert(token);
  const tempBand = thresholds[settings.birdType].temperatureC[settings.ageWeeks as AgeWeek];

  const deviceAlerts = (alerts.data ?? []).filter((alert) => alert.deviceId === route.params.deviceId);

  // Group alerts by date
  const alertsByDate: Record<string, typeof deviceAlerts> = {};
  for (const alert of deviceAlerts) {
    const dateKey = new Date(alert.ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    if (!alertsByDate[dateKey]) alertsByDate[dateKey] = [];
    alertsByDate[dateKey].push(alert);
  }

  return (
    <ScrollView style={[styles.page, { backgroundColor: theme.colors.bg }]}>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.font.display }]}>{route.params.label}</Text>

      <View style={styles.range}>
        {(['24h', '7d', '30d'] as const).map((item) => {
          const active = range === item;
          return (
            <Pressable
              key={item}
              style={[styles.rangeButton, { borderColor: theme.colors.border }, active && { backgroundColor: theme.colors.primary }]}
              onPress={() => setRange(item)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${item} data`}
              accessibilityState={{ selected: active }}
            >
              <Text style={{ color: active ? theme.colors.primaryText : theme.colors.primary, fontWeight: '600', fontSize: 14 }}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      {readings.isLoading ? (
        <>
          <SkeletonLoader variant="chart" />
          <SkeletonLoader variant="chart" />
          <SkeletonLoader variant="chart" />
        </>
      ) : readings.isError ? (
        <ErrorState message="Could not load readings" onRetry={() => void readings.refetch()} />
      ) : (
        <>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Temperature</Text>
          <MetricChart readings={readings.data ?? []} metric="tempC" minBand={tempBand.minC} maxBand={tempBand.maxC} color={theme.palette.amber[600]} />
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Humidity</Text>
          <MetricChart readings={readings.data ?? []} metric="humidityPct" minBand={45} maxBand={75} color={theme.colors.primary} />
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Ammonia (NH{'\u2083'})</Text>
          <MetricChart readings={readings.data ?? []} metric="nh3Ppm" minBand={0} maxBand={15} color={theme.palette.red[600]} />
        </>
      )}

      <Text style={[styles.section, { color: theme.colors.text, borderTopColor: theme.colors.border }]}>Alert history</Text>

      {Object.entries(alertsByDate).map(([date, dateAlerts]) => (
        <View key={date}>
          <Text style={[styles.dateHeader, { color: theme.colors.textSecondary }]}>{date}</Text>
          {dateAlerts.map((alert) => {
            const isDanger = alert.kind.includes('DANGER') || alert.kind.includes('OFFLINE');
            const statusLevel = isDanger ? 'danger' as const : 'warn' as const;
            const sc = alert.acknowledged ? theme.statusMuted(statusLevel) : theme.status(statusLevel);
            return (
              <View key={alert.id} style={[styles.alert, { backgroundColor: theme.colors.surface, borderLeftColor: alert.acknowledged ? sc.fg : theme.status(statusLevel).border, borderLeftWidth: 4 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertKind, { color: alert.acknowledged ? sc.fg : theme.colors.text, textDecorationLine: alert.acknowledged ? 'line-through' : 'none' }]}>{alert.kind.replaceAll('_', ' ')}</Text>
                  <Text style={{ color: alert.acknowledged ? sc.fg : theme.colors.textSecondary, fontSize: 13 }}>{alert.value.toFixed(1)} {'\u00b7'} {formatDateTime(alert.ts)}</Text>
                </View>
                {alert.acknowledged ? (
                  <Text style={[styles.ack, { color: sc.fg }]}>Acknowledged</Text>
                ) : (
                  <Pressable
                    style={[styles.ackButton, { borderColor: theme.colors.primary }]}
                    onPress={() => acknowledge.mutate(alert.id)}
                    accessibilityRole="button"
                    accessibilityLabel="Acknowledge alert"
                  >
                    <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600' }}>Acknowledge</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 14 },
  range: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  rangeButton: { borderRadius: 18, borderWidth: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 10 },
  chartTitle: { fontSize: 17, fontWeight: '700', marginTop: 14, marginBottom: 4 },
  section: { borderTopWidth: 1, fontSize: 21, fontWeight: '800', marginTop: 20, paddingTop: 18 },
  dateHeader: { fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 4, textTransform: 'uppercase' },
  alert: { borderRadius: 10, flexDirection: 'row', alignItems: 'center', marginTop: 8, padding: 12 },
  alertKind: { fontWeight: '700', fontSize: 14 },
  ack: { fontSize: 12, fontWeight: '700' },
  ackButton: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
});
