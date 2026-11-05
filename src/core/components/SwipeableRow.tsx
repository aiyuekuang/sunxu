import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { AppText as Text } from './AppText.tsx';
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
      <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
        {children}
      </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  actionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
});
