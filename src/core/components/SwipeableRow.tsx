import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { AppText as Text } from './AppText';
import { FontSize } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

interface SwipeAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  rightActions?: SwipeAction[];
  onPress?: () => void;
}

export function SwipeableRow({ children, rightActions, onPress }: SwipeableRowProps) {
  const swipeRef = useRef<SwipeableMethods>(null);
  const { colors } = useTheme();

  const renderRightActions = () => {
    if (!rightActions?.length) return null;
    return (
      <View style={styles.actionsContainer}>
        {rightActions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={[styles.actionButton, { backgroundColor: action.color }]}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={() => {
              swipeRef.current?.close();
              action.onPress();
            }}
          >
            <Ionicons name={action.icon} size={20} color={colors.textOnPrimary} />
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
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  actionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
});
