import { Platform, StyleSheet } from 'react-native';

const IOS_FONT_OFFSET = Platform.OS === 'ios' ? 1 : 0;

export const Spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

/** Shared maximum widths for common content columns. */
export const ContentWidth = {
  form: 720,
} as const;

export const FontSize = {
  xs: 11 + IOS_FONT_OFFSET,
  sm: 13 + IOS_FONT_OFFSET,
  base: 15 + IOS_FONT_OFFSET,
  md: 16 + IOS_FONT_OFFSET,
  lg: 18 + IOS_FONT_OFFSET,
  xl: 20 + IOS_FONT_OFFSET,
  '2xl': 24 + IOS_FONT_OFFSET,
  '3xl': 28 + IOS_FONT_OFFSET,
  '4xl': 32 + IOS_FONT_OFFSET,
  display: 48 + IOS_FONT_OFFSET,
} as const;

export const FontWeight = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/** Shared icon glyph sizes. Touch size belongs to the containing control. */
export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
} as const;

/** Semantic text styles built from the shared font-size and weight scales. */
export const Typography = {
  h1: { fontSize: FontSize['2xl'], lineHeight: 32, fontWeight: FontWeight.bold },
  h2: { fontSize: FontSize.xl, lineHeight: 28, fontWeight: FontWeight.semibold },
  h3: { fontSize: FontSize.lg, lineHeight: 24, fontWeight: FontWeight.semibold },
  body: { fontSize: FontSize.md, lineHeight: 22, fontWeight: FontWeight.regular },
  bodyMedium: { fontSize: FontSize.md, lineHeight: 22, fontWeight: FontWeight.medium },
  caption: { fontSize: FontSize.sm, lineHeight: 20, fontWeight: FontWeight.regular },
  small: { fontSize: FontSize.sm, lineHeight: 18, fontWeight: FontWeight.regular },
  tiny: { fontSize: FontSize.xs, lineHeight: 16, fontWeight: FontWeight.regular },
} as const;

export const Radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
} as const;

/** Shared sizes for compact interactive controls used across Sunxu apps. */
export const ControlSize = {
  compact: 32,
  control: 36,
  tab: 34,
  search: 36,
  rowAction: 36,
  iconButton: 32,
  actionLarge: 52,
  iconAction: 56,
  phoneAction: 68,
} as const;

/** Shared border widths for cards, dividers, and emphasized outlines. */
export const BorderWidth = {
  hairline: StyleSheet.hairlineWidth,
  default: 1,
  strong: 1.5,
} as const;

/** Shared motion durations in milliseconds. */
export const MotionDuration = {
  fast: 150,
  normal: 220,
  slow: 300,
} as const;

export const NotificationBadgeDimensions = {
  diameter: 16,
  radius: 8,
  horizontalPadding: 3,
  fontSize: 10,
  lineHeight: 12,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 0,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 0,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 0,
  },
} as const;

export const HIT_SLOP = { top: 8, right: 8, bottom: 8, left: 8 } as const;
export const MIN_TOUCH_TARGET = 44;
export const MIN_TOUCH_TARGET_ANDROID = 48;
