import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFarm } from '../api/hooks';
import { useSessionStore } from '../state/session';
import { useSettingsStore } from '../state/settings';
import { useTheme } from '../context/ThemeContext';

export function SettingsScreen(): React.JSX.Element {
  const theme = useTheme();
  const token = useSessionStore((state) => state.accessToken);
  const farmId = useSessionStore((state) => state.user?.farmId ?? null);
  const farm = useFarm(token, farmId);
  const logout = useSessionStore((state) => state.logout);
  const settings = useSettingsStore();
  const danger = theme.status('danger');

  const isDark = settings.colorMode === 'dark' || (settings.colorMode === 'system' && theme.mode === 'dark');

  return (
    <ScrollView style={[styles.page, { backgroundColor: theme.colors.bg }]}>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.font.display }]}>Settings</Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>Farm profile</Text>
      {farm.data && (
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.accent }]}>
            <Text style={{ fontSize: 24, color: theme.colors.primary, fontWeight: '700' }}>{farm.data.ownerName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.big, { color: theme.colors.text }]}>{farm.data.ownerName}</Text>
            <Text style={{ color: theme.colors.textSecondary }}>{farm.data.region} {'\u00b7'} {farm.data.flockSize} birds</Text>
            <Text style={{ color: theme.colors.textSecondary }}>{farm.data.phone}</Text>
          </View>
        </View>
      )}

      <Text style={[styles.section, { color: theme.colors.text }]}>Threshold profile</Text>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Bird type</Text>
      <View style={styles.row}>
        {(['broiler', 'layer'] as const).map((type) => (
          <Pressable
            key={type}
            style={[styles.choice, { borderColor: theme.colors.border }, settings.birdType === type && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
            onPress={() => settings.setBirdType(type)}
            accessibilityRole="button"
            accessibilityState={{ selected: settings.birdType === type }}
          >
            <Text style={{ color: settings.birdType === type ? theme.colors.primaryText : theme.colors.text, fontWeight: '600' }}>{type}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Flock age: week {settings.ageWeeks}</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5, 6].map((week) => (
          <Pressable
            key={week}
            style={[styles.age, { borderColor: theme.colors.border }, settings.ageWeeks === week && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
            onPress={() => settings.setAgeWeeks(week as 1 | 2 | 3 | 4 | 5 | 6)}
            accessibilityRole="button"
            accessibilityState={{ selected: settings.ageWeeks === week }}
          >
            <Text style={{ color: settings.ageWeeks === week ? theme.colors.primaryText : theme.colors.text, fontWeight: '600' }}>{week}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.section, { color: theme.colors.text }]}>Appearance</Text>
      <View style={[styles.settingRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={{ color: theme.colors.text, fontSize: 16 }}>Dark mode</Text>
        <Switch
          value={isDark}
          onValueChange={(v) => settings.setColorMode(v ? 'dark' : 'light')}
          trackColor={{ false: theme.palette.neutral[300], true: theme.colors.primary }}
          accessibilityLabel="Toggle dark mode"
        />
      </View>
      <Pressable
        style={[styles.settingRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => settings.setColorMode('system')}
        accessibilityRole="button"
      >
        <Text style={{ color: theme.colors.text, fontSize: 16 }}>Use system theme</Text>
        <Text style={{ color: settings.colorMode === 'system' ? theme.colors.primary : theme.colors.textMuted, fontWeight: '600' }}>{settings.colorMode === 'system' ? 'Active' : ''}</Text>
      </Pressable>

      <Text style={[styles.section, { color: theme.colors.text }]}>Language</Text>
      <View style={styles.row}>
        {[['en', 'English'], ['sw', 'Swahili'], ['tw', 'Twi']].map(([code, label]) => (
          <Pressable
            key={code}
            style={[styles.choice, { borderColor: theme.colors.border }, settings.language === code && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
            onPress={() => settings.setLanguage(code as 'en' | 'sw' | 'tw')}
            accessibilityRole="button"
            accessibilityState={{ selected: settings.language === code }}
          >
            <Text style={{ color: settings.language === code ? theme.colors.primaryText : theme.colors.text, fontWeight: '600' }}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.stub, { color: theme.colors.textMuted }]}>Swahili and Twi translations are prepared for a future release.</Text>

      <Pressable
        style={[styles.logoutButton, { borderColor: danger.fg }]}
        onPress={logout}
        accessibilityRole="button"
        accessibilityLabel="Log out"
      >
        <Text style={{ color: danger.fg, fontWeight: '700', fontSize: 16 }}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '800' },
  section: { fontSize: 20, fontWeight: '800', marginBottom: 10, marginTop: 24 },
  card: { borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 14, padding: 16 },
  avatar: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  profileInfo: { flex: 1, gap: 4 },
  big: { fontSize: 21, fontWeight: '700' },
  label: { fontSize: 16, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderRadius: 18, borderWidth: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 10 },
  age: { alignItems: 'center', borderRadius: 18, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  settingRow: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 16, paddingVertical: 14 },
  stub: { fontSize: 14, marginTop: 10 },
  logoutButton: { alignItems: 'center', borderRadius: 10, borderWidth: 1.5, marginBottom: 40, marginTop: 32, minHeight: 48, justifyContent: 'center', paddingVertical: 14 },
});
