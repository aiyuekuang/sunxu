import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useRef } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { AppText as Text } from './AppText';
import { FontSize } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface SwipeAction {
  /** Short label shown with the action icon after swiping. */
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  /** Prevents an action while its owner is performing another operation. */
  disabled?: boolean;
  /** Shows a busy indicator and blocks repeated activation. */
  loading?: boolean;
  /** Runs after the swipe action area closes. */
  onPress: () => void;
}

export interface SwipeableRowProps {
  /** Presentational row content. Keep the main content non-interactive. */
  children: React.ReactNode;
  /** Secondary actions revealed by swiping the row left. */
  rightActions?: SwipeAction[];
  /** Primary row action, normally opening its detail view. */
  onPress?: () => void;
  /** Spoken name for the primary action. */
  accessibilityLabel?: string;
  /** Optional spoken hint; defaults to a swipe hint when actions exist. */
  accessibilityHint?: string;
}

export function SwipeableRow({
  children,
  rightActions,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: SwipeableRowProps) {
  const swipeRef = useRef<SwipeableMethods>(null);
  const { colors } = useTheme();

  const renderRightActions = () => {
    if (!rightActions?.length) return null;
    return (
      <View style={styles.actionsContainer}>
        {rightActions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={[
              styles.actionButton,
              {
                backgroundColor: action.color,
                opacity: action.disabled || action.loading ? 0.55 : 1,
              },
            ]}
            activeOpacity={0.7}
            disabled={action.disabled || action.loading}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityState={{ disabled: action.disabled || action.loading, busy: action.loading }}
            onPress={() => {
              swipeRef.current?.close();
              action.onPress();
            }}
          >
            {action.loading ? (
              <ActivityIndicator size="small" color={colors.textOnPrimary} />
            ) : (
              <Ionicons name={action.icon} size={20} color={colors.textOnPrimary} />
            )}
            <Text style={[styles.actionLabel, { color: colors.textOnPrimary }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      friction={1}
      overshootRight={false}
      containerStyle={styles.container}
    >
      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={
            accessibilityHint ??
            (rightActions?.length ? '向左滑动查看更多操作' : undefined)
          }
        >
          {children}
        </TouchableOpacity>
      ) : (
        children
      )}
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 56,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  actionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
});
