import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }) });

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('danger-alerts', { name: 'Danger alerts', importance: Notifications.AndroidImportance.HIGH });
  const permissions = await Notifications.getPermissionsAsync();
  let status = permissions.status;
  if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return null;
  try { return (await Notifications.getExpoPushTokenAsync()).data; } catch { return null; }
}
