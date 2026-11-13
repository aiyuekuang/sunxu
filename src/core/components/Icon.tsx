import { MaterialCommunityIcons } from '@expo/vector-icons';
import type React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { IconSize } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Omit for a decorative glyph; provide a label only when the icon conveys information by itself. */
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<TextStyle>;
}

/** Theme-aware standalone glyph. Interactive icons should use IconActionButton. */
export function Icon({
  name,
  size = IconSize.md,
  color,
  accessibilityLabel,
  testID,
  style,
}: IconProps) {
  const { colors } = useTheme();

  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color ?? colors.textSecondary}
      accessible={Boolean(accessibilityLabel)}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? 'auto' : 'no'}
      testID={testID}
      style={style}
    />
  );
}
