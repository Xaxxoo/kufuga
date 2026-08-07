import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { createTheme, type NativeTheme } from '@kufuga/ui/native-theme';
import { useSettingsStore } from '../state/settings';

const ThemeContext = createContext<NativeTheme>(createTheme('light'));

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const systemScheme = useColorScheme();
  const colorMode = useSettingsStore((s) => s.colorMode);
  const mode = colorMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : colorMode;
  const theme = useMemo(() => createTheme(mode), [mode]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): NativeTheme {
  return useContext(ThemeContext);
}
