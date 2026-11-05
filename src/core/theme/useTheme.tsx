import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, type ThemeColors } from './colors';

interface ThemeOverride {
  colors?: ThemeColors;
  isDark?: boolean;
}

const ThemeContext = createContext<ThemeOverride | undefined>(undefined);

export interface ThemeProviderProps extends ThemeOverride {
  children: React.ReactNode;
}

export function ThemeProvider({ children, colors, isDark }: ThemeProviderProps) {
  const value = useMemo(() => ({ colors, isDark }), [colors, isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const scheme = useColorScheme();
  const override = useContext(ThemeContext);
  const isDark = override?.isDark ?? scheme === 'dark';
  return { colors: override?.colors ?? (isDark ? Colors.dark : Colors.light), isDark };
}
