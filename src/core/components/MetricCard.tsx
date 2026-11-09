import type React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { FontSize, Radius, Shadow, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

export interface MetricCardProps {
  label: string;
  value: number | string;
  children?: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  accentColor?: string;
  accentBackgroundColor?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  valueStyle?: StyleProp<TextStyle>;
}

/** Compact metric summary; data and drill-down behavior stay with the host. */
export function MetricCard({
  label,
  value,
  children,
  onPress,
  selected = false,
  disabled = false,
  compact = false,
  accentColor,
  accentBackgroundColor,
  accessibilityLabel,
  style,
  valueStyle,
}: MetricCardProps) {
  const { colors } = useTheme();
  const content = (
    <>
      {children}
      <AppText numberOfLines={1} style={[compact ? styles.valueCompact : styles.value, { color: accentColor ?? colors.text }, valueStyle]}>
        {value}
      </AppText>
      <AppText numberOfLines={2} style={[styles.label, { color: colors.textSecondary }, compact && styles.labelCompact]}>
        {label}
      </AppText>
    </>
  );
  const cardStyle = [
    styles.card,
    compact && styles.compactCard,
    { backgroundColor: accentBackgroundColor ?? colors.surface, borderColor: selected ? colors.primary : colors.border },
    disabled && styles.disabled,
    style,
  ];

  if (!onPress) return <View style={cardStyle}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${label}：${value}`}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 0,
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    ...Shadow.sm,
  },
  compactCard: { minHeight: 56, paddingVertical: Spacing.xs },
  value: { fontSize: FontSize.xl, lineHeight: 26, fontWeight: '700' },
  valueCompact: { fontSize: FontSize.md, lineHeight: 20, fontWeight: '700' },
  label: { fontSize: FontSize.xs, lineHeight: 16, fontWeight: '500', textAlign: 'center' },
  labelCompact: { fontSize: FontSize.xs, lineHeight: 14 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.84 },
});
