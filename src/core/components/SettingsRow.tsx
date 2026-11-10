import { MaterialCommunityIcons } from '@expo/vector-icons';
import type React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { FontSize, IconSize, MIN_TOUCH_TARGET_ANDROID, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { InlineLoading } from './LoadingView';
import { ScalePressable } from './ScalePressable';

type SettingsIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface SettingsRowProps {
  icon: SettingsIcon;
  label: string;
  description?: string;
  value?: string;
  valueColor?: string;
  /** Custom trailing state or action hint, such as a permission status. */
  accessory?: React.ReactNode;
  /** Keep the disclosure arrow visible when an accessory is present. */
  showDisclosure?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** Shared settings/navigation row with optional value, loading state, and disclosure affordance. */
export function SettingsRow({
  icon,
  label,
  description,
  value,
  valueColor,
  accessory,
  showDisclosure = true,
  onPress,
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: SettingsRowProps) {
  const { colors } = useTheme();
  const unavailable = disabled || loading;

  const content = (
    <>
      <View style={styles.leading}>
        <MaterialCommunityIcons name={icon} size={IconSize.md} color={colors.textSecondary} accessible={false} />
        <View style={styles.labelColumn}>
          <AppText style={[styles.label, { color: colors.text }]} numberOfLines={1}>
            {label}
          </AppText>
          {description ? (
            <AppText style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {description}
            </AppText>
          ) : null}
        </View>
      </View>
      <View style={styles.trailing}>
        {loading ? (
          <InlineLoading size={IconSize.sm} color={colors.primary} />
        ) : accessory ? (
          accessory
        ) : value ? (
          <AppText style={[styles.value, { color: valueColor ?? colors.textSecondary }]} numberOfLines={2}>
            {value}
          </AppText>
        ) : null}
        {onPress && !loading && showDisclosure ? (
          <MaterialCommunityIcons name="chevron-right" size={IconSize.md} color={colors.textTertiary} accessible={false} />
        ) : null}
      </View>
    </>
  );

  const rowStyle = [styles.row, style];
  if (!onPress) return <View style={rowStyle} testID={testID}>{content}</View>;

  return (
    <ScalePressable
      testID={testID}
      style={rowStyle}
      onPress={onPress}
      disabled={unavailable}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${label}${value ? ` ${value}` : ''}`}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: unavailable, busy: loading }}
    >
      {content}
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    minHeight: MIN_TOUCH_TARGET_ANDROID,
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '58%',
    marginLeft: Spacing.sm,
    gap: Spacing.xs,
  },
  label: { flexShrink: 1 },
  labelColumn: { flex: 1, minWidth: 0, gap: Spacing.none },
  description: { fontSize: FontSize.sm, lineHeight: 19, flexShrink: 1 },
  value: { fontSize: FontSize.base, lineHeight: 20, minWidth: 0, flexShrink: 1, textAlign: 'right' },
});
