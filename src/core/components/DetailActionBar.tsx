import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from './AppText';
import { MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { BottomSheet } from './BottomSheet';

/**
 * Presentation-only action for a record detail. Callers own permission, status,
 * and workflow rules and pass only actions currently available to the user.
 */
export interface DetailAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tone?: 'default' | 'destructive' | 'success';
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
}

interface DetailActionBarProps {
  /** Actions are ordered by task priority; the first four remain in the bar. */
  actions: DetailAction[];
  /** Set false when the parent footer or safe-area container already owns the bottom inset. */
  includeBottomInset?: boolean;
  /** Shared semantic cap; the remaining actions are disclosed through the ellipsis sheet. */
  maxVisibleActions?: number;
}

/**
 * Component contract
 * Layer: composite. Stable job: expose the current record's page-level actions.
 * Non-goals: permission checks, state transitions, API calls, and action feedback.
 * Visible owner: the active record detail screen or detail modal.
 * Source: React Native 0.83 Pressable, Ionicons from @expo/vector-icons 15,
 * the project BottomSheet wrapper (gorhom 5), AppText, theme colors/spacing,
 * safe-area context, and the shared 44pt/48dp target constants.
 * Anatomy: fixed surface strip → ordered icon buttons → optional ellipsis →
 * labeled overflow sheet. Callers own outer placement and bottom-inset ownership.
 * API: ordered DetailAction[]; optional maxVisibleActions (default 4) and
 * includeBottomInset (default true). Labels are accessible names and are shown
 * in the overflow sheet. Caller filters actions by permission and record state.
 * Variants: none. A configurable visible-action cap changes disclosure only.
 * States: default; pressed (opacity); disabled (native state/no action); loading
 * (spinner, busy and disabled); expanded (labeled sheet); empty (not rendered).
 * Error/success outcomes are not applicable here and remain with the caller.
 * Layout: one semantic surface with a hairline top border; parent owns footer
 * position, while this component owns button hit areas and internal spacing.
 * Responsive: first four actions remain visible; later actions move to the sheet,
 * preserving caller order. Text labels remain complete in the sheet.
 * Accessibility: icon actions expose caller-supplied names/hints and disabled,
 * busy, or expanded state; focus order matches visual order. Hit areas are at
 * least 44pt on iOS and 48dp on Android. The overflow has named text actions.
 * Data boundary: presentation only; actions execute after the sheet dismisses.
 * Closest rejected option: page-local action rows, which duplicate geometry and
 * overflow behavior across modules and cannot maintain one shared contract.
 */
export function DetailActionBar({
  actions,
  includeBottomInset = true,
  maxVisibleActions = 4,
}: DetailActionBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [overflowVisible, setOverflowVisible] = useState(false);
  const pendingActionIdRef = useRef<string | null>(null);
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  const touchTarget = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;

  const visibleActions = useMemo(
    () => actions.slice(0, Math.max(1, maxVisibleActions)),
    [actions, maxVisibleActions],
  );
  const overflowActions = useMemo(
    () => actions.slice(Math.max(1, maxVisibleActions)),
    [actions, maxVisibleActions],
  );

  useEffect(() => {
    if (overflowActions.length === 0 && overflowVisible) setOverflowVisible(false);
  }, [overflowActions.length, overflowVisible]);

  const handleOverflowDismiss = () => {
    const actionId = pendingActionIdRef.current;
    pendingActionIdRef.current = null;
    const action = actionsRef.current.find((item) => item.id === actionId);
    action?.onPress();
  };

  const actionColor = (action: DetailAction) => {
    if (action.tone === 'destructive') return colors.error;
    if (action.tone === 'success') return colors.success;
    return colors.primary;
  };

  if (actions.length === 0) return null;

  return (
    <>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: includeBottomInset ? (insets.bottom || Spacing.sm) : 0,
          },
        ]}
      >
        <View style={styles.actionsRow}>
          {visibleActions.map((action) => (
            <Pressable
              key={action.id}
              style={({ pressed }) => [
                styles.iconButton,
                { minHeight: touchTarget },
                pressed && !action.disabled && !action.loading && styles.pressed,
                action.disabled && !action.loading && styles.disabled,
              ]}
              onPress={action.onPress}
              disabled={action.disabled || action.loading}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityHint={action.accessibilityHint}
              accessibilityState={{ disabled: Boolean(action.disabled || action.loading), busy: Boolean(action.loading) }}
            >
              {action.loading ? (
                <ActivityIndicator size="small" color={actionColor(action)} />
              ) : (
                <Ionicons name={action.icon} size={22} color={actionColor(action)} accessible={false} />
              )}
            </Pressable>
          ))}
          {overflowActions.length > 0 ? (
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                { minHeight: touchTarget },
                pressed && styles.pressed,
              ]}
              onPress={() => setOverflowVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="更多详情操作"
              accessibilityState={{ expanded: overflowVisible }}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.textSecondary} accessible={false} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <BottomSheet
        visible={overflowVisible}
        onClose={() => setOverflowVisible(false)}
        onDismiss={handleOverflowDismiss}
        title="更多操作"
        dynamicHeight
        maxHeightRatio={0.7}
      >
        <View style={styles.actionList}>
          {overflowActions.map((action) => (
            <Pressable
              key={action.id}
              style={({ pressed }) => [
                styles.actionRow,
                { borderBottomColor: colors.borderLight },
                pressed && !action.disabled && !action.loading && styles.pressed,
                action.disabled && !action.loading && styles.disabled,
              ]}
              onPress={() => {
                if (action.disabled || action.loading) return;
                pendingActionIdRef.current = action.id;
                setOverflowVisible(false);
              }}
              disabled={action.disabled || action.loading}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityHint={action.accessibilityHint}
              accessibilityState={{ disabled: Boolean(action.disabled || action.loading), busy: Boolean(action.loading) }}
            >
              {action.loading ? (
                <ActivityIndicator size="small" color={actionColor(action)} />
              ) : (
                <Ionicons name={action.icon} size={20} color={actionColor(action)} accessible={false} />
              )}
              <Text style={[styles.actionLabel, { color: action.tone === 'destructive' ? colors.error : colors.text }]}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionsRow: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  iconButton: {
    width: 52,
    minWidth: 52,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.45 },
  actionList: { paddingBottom: Spacing.sm },
  actionRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionLabel: { fontSize: 15, fontWeight: '500' },
});
