import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { RecordsScreen } from '../screens/RecordsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../context/ThemeContext';

const Tabs = createBottomTabNavigator();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }): React.JSX.Element {
  const theme = useTheme();
  return <Text style={{ fontSize: 20, color: focused ? theme.colors.primary : theme.palette.neutral[500] }}>{icon}</Text>;
}

export function MainTabs(): React.JSX.Element {
  const theme = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerTitle: 'Kufuga',
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.text, fontFamily: theme.font.display, fontWeight: '700' },
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, borderTopWidth: 1 },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.palette.neutral[500],
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Farm', tabBarIcon: ({ focused }) => <TabIcon icon={'\uD83C\uDFE0'} focused={focused} />, tabBarAccessibilityLabel: 'Farm dashboard' }} />
      <Tabs.Screen name="Records" component={RecordsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon={'\uD83D\uDCCB'} focused={focused} />, tabBarAccessibilityLabel: 'Trusted records' }} />
      <Tabs.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon={'\u2699'} focused={focused} />, tabBarAccessibilityLabel: 'Settings' }} />
    </Tabs.Navigator>
  );
}
