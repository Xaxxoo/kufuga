import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthScreen } from './screens/AuthScreen';
import { DeviceDetailScreen } from './screens/DeviceDetailScreen';
import { MainTabs } from './navigation/MainTabs';
import { useSessionStore } from './state/session';
import { registerForPushNotifications } from './notifications';
import { registerPushToken } from './api/client';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { navigationLightTheme, navigationDarkTheme } from '@kufuga/ui/native-theme';

export type RootStackParamList = { Auth: undefined; Main: undefined; DeviceDetail: { deviceId: string; label: string }; };

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, gcTime: 7 * 24 * 60 * 60 * 1000, retry: 1 } } });
const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: 'kufuga-query-cache' });

function PushRegistration(): null {
  const token = useSessionStore((state) => state.accessToken);
  useEffect(() => {
    if (!token) return;
    void registerForPushNotifications().then((pushToken) => {
      if (pushToken) return registerPushToken(token, pushToken);
    });
  }, [token]);
  return null;
}

function AppNavigator(): React.JSX.Element {
  const accessToken = useSessionStore((state) => state.accessToken);
  const theme = useTheme();
  const navTheme = theme.mode === 'dark' ? navigationDarkTheme : navigationLightTheme;
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerBackTitle: 'Back', headerStyle: { backgroundColor: theme.colors.surface }, headerTintColor: theme.colors.text }}>
        {accessToken ? <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} options={({ route }) => ({ title: route.params.label })} />
        </> : <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App(): React.JSX.Element {
  const hydrated = useSessionStore((state) => state.hydrated);
  if (!hydrated) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>;
  return (
    <ErrorBoundary>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <PushRegistration />
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  );
}
