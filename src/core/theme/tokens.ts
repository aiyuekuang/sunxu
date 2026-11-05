import { Platform } from 'react-native';

const IOS_FONT_OFFSET = Platform.OS === 'ios' ? 1 : 0;

export const Spacing = {
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
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
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
