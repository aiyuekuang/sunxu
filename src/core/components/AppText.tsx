import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { scaleTextStyle, useFontScale } from '../theme/font-scale';

/**
 * Drop-in replacement for RN's Text.
 * Automatically multiplies any fontSize in the style prop by the user's
 * preferred font scale (set in 设置 → 字体大小).
 *
 * Usage: just change the import —
 *   import { Text } from 'react-native'
 *   → import { AppText as Text } from './AppText.tsx'
 *
 * No other code changes required.
 */
export function AppText({ style, ...props }: TextProps) {
  const scale = useFontScale();

  const scaledStyle = React.useMemo(() => {
    const flat = StyleSheet.flatten(style) as TextStyle | undefined;
    const normalizedStyle = scaleTextStyle(flat, scale);
    if (normalizedStyle === flat) return style;
    return normalizedStyle;
  }, [style, scale]);

  return <Text style={scaledStyle} {...props} />;
}
