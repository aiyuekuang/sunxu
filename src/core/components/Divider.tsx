import type React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/** Theme-aware hairline divider for separating related content. */
export function Divider({ orientation = 'horizontal', color, style }: DividerProps) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        { backgroundColor: color ?? colors.border },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: { height: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
  vertical: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
});
