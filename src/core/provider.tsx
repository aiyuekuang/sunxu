import type { PropsWithChildren } from 'react';
import type { ThemeColors } from './theme/colors';
import { FontScaleProvider } from './theme/font-scale';
import { ThemeProvider } from './theme/useTheme';

export interface SunxuProviderProps extends PropsWithChildren {
  /** Semantic light or dark palette supplied by the host app. */
  theme?: ThemeColors;
  /** Optional color-scheme state when the host controls its own appearance. */
  isDark?: boolean;
  /** User-selected font scale; persisted settings remain owned by the host app. */
  fontScale?: number;
}

export function SunxuProvider({
  children,
  theme,
  isDark,
  fontScale = 1,
}: SunxuProviderProps) {
  return (
    <ThemeProvider colors={theme} isDark={isDark}>
      <FontScaleProvider scale={fontScale}>{children}</FontScaleProvider>
    </ThemeProvider>
  );
}
