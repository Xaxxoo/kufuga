import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDevices, useAnchors, usePolicies, useVerifyAnchor } from '../api/hooks';
import { useSessionStore } from '../state/session';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/EmptyState';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { formatDate } from '@kufuga/ui/format';
import type { AnchorBatch, Device } from '../api/client';

function AnchorRow({ token, device, batch }: { token: string; device: Device; batch: AnchorBatch }): React.JSX.Element {
  const theme = useTheme();
  const verification = useVerifyAnchor(token, device.id, batch.id);
  const txUrl = verification.data?.txUrl ?? `https://stellar.expert/explorer/testnet/tx/${batch.stellarTxHash}`;
  const verified = verification.data?.verified;

  const badgeColors = verified ? theme.status('safe') : theme.status('warn');

  return (
    <View style={[styles.batch, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderLeftColor: badgeColors.border, borderLeftWidth: 4 }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.batchTitle, { color: theme.colors.text }]}>{device.label} {'\u00b7'} {formatDate(batch.periodStart)}</Text>
        <Text style={[styles.muted, { color: theme.colors.textSecondary }]}>{batch.readingCount} readings {'\u00b7'} ledger {batch.ledger}</Text>
        {verified && (
          <View style={[styles.verifiedBadge, { backgroundColor: badgeColors.bg }]}>
            <Text style={{ color: badgeColors.fg, fontSize: 13, fontWeight: '600' }}>{'\u2713'} This record matches the public ledger</Text>
          </View>
        )}
      </View>
      {verified ? (
        <Pressable
          onPress={() => void Linking.openURL(txUrl)}
          accessibilityRole="link"
          accessibilityLabel="View on public ledger"
        >
          <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600' }}>View on{'\n'}public ledger</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => void Linking.openURL(txUrl)}
          style={[styles.verifyButton, { backgroundColor: badgeColors.bg }]}
          accessibilityRole="button"
          accessibilityLabel="Tap to verify record"
        >
          <Text style={{ color: badgeColors.fg, fontSize: 12, fontWeight: '700' }}>
            {verification.isLoading ? 'Checking\u2026' : 'Tap to verify'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function DeviceRecords({ token, device }: { token: string; device: Device }): React.JSX.Element {
  const anchors = useAnchors(token, device.id);
  if ((anchors.data ?? []).length === 0) return <></>;
  return <>{(anchors.data ?? []).map((batch) => <AnchorRow key={batch.id} token={token} device={device} batch={batch} />)}</>;
}

export function RecordsScreen(): React.JSX.Element {
  const theme = useTheme();
  const token = useSessionStore((state) => state.accessToken);
  const farmId = useSessionStore((state) => state.user?.farmId ?? null);
  const devices = useDevices(token, farmId);
  const policies = usePolicies(token, farmId);

  return (
    <ScrollView style={[styles.page, { backgroundColor: theme.colors.bg }]}>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.font.display }]}>Trusted records</Text>
      <View style={[styles.explainer, { backgroundColor: theme.colors.accent }]}>
        <Text style={[styles.explainerText, { color: theme.colors.text }]}>
          Each hour, Kufuga makes a fingerprint of your readings and records it on a public ledger. A green check means the readings in this app still match that public record.
        </Text>
      </View>

      <Text style={[styles.section, { color: theme.colors.text }]}>Parametric cover</Text>
      {policies.isLoading ? (
        <><SkeletonLoader variant="row" /><SkeletonLoader variant="row" /></>
      ) : (policies.data ?? []).length === 0 ? (
        <EmptyState title="No active protection policies" subtitle="Parametric cover will appear here once your farm is enrolled." />
      ) : (
        (policies.data ?? []).map((policy) => {
          const policyStatus = policy.status === 'active' ? 'safe' : 'warn';
          const sc = theme.status(policyStatus as 'safe' | 'warn');
          return (
            <View key={policy.id} style={[styles.policy, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.policyHeader}>
                <Text style={[styles.batchTitle, { color: theme.colors.text }]}>{policy.deviceLabel ?? 'House'} {'\u00b7'} {policy.peril === 'TempHigh' ? 'Heat protection' : policy.peril}</Text>
                <View style={[styles.statusChip, { backgroundColor: sc.bg }]}>
                  <Text style={{ color: sc.fg, fontSize: 11, fontWeight: '700' }}>{policy.status}</Text>
                </View>
              </View>
              <Text style={[styles.muted, { color: theme.colors.textSecondary }]}>Pays {policy.payoutAmount} after {policy.consecutivePeriods} verified hot periods</Text>
            </View>
          );
        })
      )}

      <Text style={[styles.section, { color: theme.colors.text }]}>Verified records</Text>
      {devices.isLoading ? (
        <><SkeletonLoader variant="row" /><SkeletonLoader variant="row" /><SkeletonLoader variant="row" /></>
      ) : (devices.data ?? []).length === 0 ? (
        <EmptyState title="No verified records yet" subtitle="Records will appear here as sensor data is verified on the public ledger." />
      ) : (
        (devices.data ?? []).map((device) => <DeviceRecords key={device.id} token={token!} device={device} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 10 },
  section: { fontSize: 20, fontWeight: '800', marginBottom: 8, marginTop: 24 },
  explainer: { borderRadius: 12, marginBottom: 16, padding: 15 },
  explainerText: { fontSize: 15, lineHeight: 22 },
  policy: { borderRadius: 12, borderWidth: 1, marginBottom: 10, padding: 14 },
  policyHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statusChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  batch: { borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, padding: 14 },
  batchTitle: { fontWeight: '700' },
  muted: { marginTop: 4, fontSize: 14 },
  verifiedBadge: { borderRadius: 6, marginTop: 8, paddingHorizontal: 8, paddingVertical: 4 },
  verifyButton: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
});
