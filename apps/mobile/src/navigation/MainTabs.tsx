import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { RecordsScreen } from '../screens/RecordsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tabs = createBottomTabNavigator();
export function MainTabs(): React.JSX.Element {
  return <Tabs.Navigator screenOptions={{ headerTitle: 'Kufuga', tabBarLabelStyle: { fontSize: 12 } }}>
    <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Farm' }} />
    <Tabs.Screen name="Records" component={RecordsScreen} />
    <Tabs.Screen name="Settings" component={SettingsScreen} />
  </Tabs.Navigator>;
}
