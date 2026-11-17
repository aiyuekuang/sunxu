import { createContext, useContext, type PropsWithChildren, type ReactNode } from 'react';

/** Named UI affordances. A host renderer may also accept its own icon names. */
export type IconName = string;

export interface IconProps {
  name: IconName;
  size?: string;
  color?: string;
  className?: string;
}

export interface TaroTheme {
  /** Native Switch requires a resolved color, rather than a CSS variable. */
  primaryColor: string;
}

export interface SunxuTaroProviderProps extends PropsWithChildren {
  renderIcon: (props: IconProps) => ReactNode;
  theme?: Partial<TaroTheme>;
}

const DEFAULT_THEME: TaroTheme = { primaryColor: '#007D35' };
const IconRendererContext = createContext<SunxuTaroProviderProps['renderIcon'] | null>(null);
const ThemeContext = createContext<TaroTheme>(DEFAULT_THEME);

/** Keeps assets, branding and platform icon delivery in the consuming app. */
export function SunxuTaroProvider({ children, renderIcon, theme }: SunxuTaroProviderProps) {
  return (
    <ThemeContext.Provider value={{ ...DEFAULT_THEME, ...theme }}>
      <IconRendererContext.Provider value={renderIcon}>{children}</IconRendererContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTaroTheme() {
  return useContext(ThemeContext);
}

export function useIconRenderer() {
  const renderIcon = useContext(IconRendererContext);
  if (!renderIcon) throw new Error('Icon controls require SunxuTaroProvider with a renderIcon callback.');
  return renderIcon;
}
