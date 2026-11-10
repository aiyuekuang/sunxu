import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { AppText as Text } from './AppText';
import { useTheme } from '../theme/useTheme';
import {
  FontSize,
  FontWeight,
  IconSize,
  MIN_TOUCH_TARGET,
  MIN_TOUCH_TARGET_ANDROID,
  Radius,
  Spacing,
} from '../theme/tokens';

export interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  subtitle?: string;
  right?: React.ReactNode;
  closeDisabled?: boolean;
  closeAccessibilityLabel?: string;
  /** Safe-area inset owned by the modal container; page callers should not set this. */
  topInset?: number;
  /** Additional breathing room after the system inset. */
  topPadding?: number;
  bordered?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/** @sunxu-component shared */
/** Canonical title and close control shared by Sunxu modal containers. */
export function ModalHeader({
  title,
  onClose,
  subtitle,
  right,
  closeDisabled = false,
  closeAccessibilityLabel = '关闭弹窗',
  topInset = 0,
  topPadding = Spacing.md,
  bordered = false,
  style,
  testID = 'modal-header',
}: ModalHeaderProps) {
  const { colors } = useTheme();
  const touchTarget = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;

  return (
    <View
      style={[
        styles.header,
        {
          minHeight: touchTarget + Spacing.xs,
          paddingTop: topInset + topPadding,
          paddingBottom: Spacing.xs,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: bordered ? StyleSheet.hairlineWidth : 0,
        },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.textColumn}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.actions, subtitle ? styles.actionsWithSubtitle : null]}>
        {right}
        <Pressable
          onPress={onClose}
          disabled={closeDisabled}
          hitSlop={8}
          style={({ pressed }) => [
            styles.closeButton,
            { width: touchTarget, height: touchTarget },
            closeDisabled ? styles.disabled : null,
            pressed && !closeDisabled ? styles.pressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={closeAccessibilityLabel}
          accessibilityState={{ disabled: closeDisabled }}
          testID="modal-close-button"
        >
          <Ionicons
            name="close"
            size={IconSize.lg}
            color={closeDisabled ? colors.textMuted : colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.none,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionsWithSubtitle: {
    alignSelf: 'flex-start',
    marginTop: -Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    lineHeight: 26,
    fontWeight: FontWeight.semibold,
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.6,
  },
});
