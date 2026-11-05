import { createContext, useContext } from 'react';
import { Platform, type TextStyle } from 'react-native';

export type FontScaleLevel = 'normal' | 'medium' | 'large' | 'xlarge';

export const FONT_SCALE_MAP: Record<FontScaleLevel, number> = {
  normal: 1,
  medium: 1.15,
  large: 1.3,
  xlarge: 1.5,
};

export const FONT_SCALE_LABELS: Record<FontScaleLevel, string> = {
  normal: '标准',
  medium: '中等',
  large: '大',
  xlarge: '超大',
};

export const DEFAULT_APP_TEXT_FONT_SIZE = Platform.OS === 'ios' ? 16 : 15;
export const IOS_MIN_READABLE_FONT_SIZE = 13;

const FontScaleContext = createContext(1);

export interface FontScaleProviderProps {
  scale: number;
  children: React.ReactNode;
}

export function FontScaleProvider({ scale, children }: FontScaleProviderProps) {
  return <FontScaleContext.Provider value={scale}>{children}</FontScaleContext.Provider>;
}

export function useFontScale(): number {
  return useContext(FontScaleContext);
}

export function scaleFontSize(fontSize = DEFAULT_APP_TEXT_FONT_SIZE, scale = 1): number {
  const scaled = Math.round(fontSize * scale);
  if (Platform.OS !== 'ios' || scaled <= 0) return scaled;
  return Math.max(scaled, IOS_MIN_READABLE_FONT_SIZE);
}

export function scaleTextStyle(
  style: TextStyle | undefined,
  scale: number,
  defaultFontSize = DEFAULT_APP_TEXT_FONT_SIZE,
): TextStyle {
  const fontSize = scaleFontSize(
    typeof style?.fontSize === 'number' ? style.fontSize : defaultFontSize,
    scale,
  );
  const next: TextStyle = style ? { ...style, fontSize } : { fontSize };
  if (typeof style?.lineHeight === 'number') {
    next.lineHeight = Math.max(fontSize, Math.round(style.lineHeight * scale));
  }
  return next;
}

export function useScaledFontSize(fontSize = DEFAULT_APP_TEXT_FONT_SIZE): number {
  return scaleFontSize(fontSize, useFontScale());
}
