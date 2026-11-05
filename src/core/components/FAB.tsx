import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {
  Animated,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  type LayoutChangeEvent,
  type ViewStyle,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shadow, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  /** 允许用户在当前父容器内拖动，并吸附到最近边缘。 */
  draggable?: boolean;
  /** 可选：持久化拖动后的位置，避免每次进入页面都要重新摆放。 */
  storageKey?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

interface FABPosition {
  right: number;
  bottom: number;
}

const FAB_SIZE = 56;
const FAB_EDGE_GUTTER = Spacing.md;

function getDefaultPosition(bottomInset: number): FABPosition {
  return {
    right: Spacing.lg,
    bottom: Math.max(bottomInset, Spacing.base) + Spacing.md,
  };
}

function isFABPosition(value: unknown): value is FABPosition {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.right === 'number' &&
    Number.isFinite(candidate.right) &&
    candidate.right >= 0 &&
    typeof candidate.bottom === 'number' &&
    Number.isFinite(candidate.bottom) &&
    candidate.bottom >= 0
  );
}

function clampPosition(position: FABPosition, width: number, height: number): FABPosition {
  const maxRight = Math.max(FAB_EDGE_GUTTER, width - FAB_SIZE - FAB_EDGE_GUTTER);
  const maxBottom = Math.max(FAB_EDGE_GUTTER, height - FAB_SIZE - FAB_EDGE_GUTTER);
  return {
    right: Math.min(Math.max(position.right, FAB_EDGE_GUTTER), maxRight),
    bottom: Math.min(Math.max(position.bottom, FAB_EDGE_GUTTER), maxBottom),
  };
}

function snapToNearestHorizontalEdge(
  position: FABPosition,
  width: number,
  height: number,
): FABPosition {
  const clamped = clampPosition(position, width, height);
  const maxRight = Math.max(FAB_EDGE_GUTTER, width - FAB_SIZE - FAB_EDGE_GUTTER);
  const distanceToRightEdge = clamped.right - FAB_EDGE_GUTTER;
  const distanceToLeftEdge = maxRight - clamped.right;
  return {
    right: distanceToRightEdge <= distanceToLeftEdge ? FAB_EDGE_GUTTER : maxRight,
    bottom: clamped.bottom,
  };
}

function positionsEqual(left: FABPosition, right: FABPosition): boolean {
  return left.right === right.right && left.bottom === right.bottom;
}

export function FAB({
  onPress,
  icon = 'add',
  style,
  draggable = false,
  storageKey,
  accessibilityLabel,
  accessibilityHint,
}: FABProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const defaultPosition = getDefaultPosition(insets.bottom);
  const [position, setPosition] = useState<FABPosition>(defaultPosition);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerSizeRef = useRef(containerSize);
  const positionRef = useRef(position);
  const dragStartRef = useRef(position);
  const didDragRef = useRef(false);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (!draggable || !storageKey) return;
    let active = true;
    void AsyncStorage.getItem(storageKey).then((serialized) => {
      if (!active || !serialized) return;
      try {
        const parsed: unknown = JSON.parse(serialized);
        if (isFABPosition(parsed)) {
          const size = containerSizeRef.current;
          const next =
            size.width > 0 && size.height > 0
              ? clampPosition(parsed, size.width, size.height)
              : parsed;
          positionRef.current = next;
          setPosition(next);
        }
      } catch {
        // 位置偏好损坏时保留默认位置，不影响新增操作。
      }
    });
    return () => {
      active = false;
    };
  }, [draggable, storageKey]);

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const nextSize = {
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    };
    containerSizeRef.current = nextSize;
    setContainerSize(nextSize);
    setPosition((current) => {
      const next = clampPosition(current, nextSize.width, nextSize.height);
      positionRef.current = next;
      return positionsEqual(current, next) ? current : next;
    });
  }, []);

  const savePosition = useCallback(
    (next: FABPosition) => {
      if (storageKey) void AsyncStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          draggable && (Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4),
        onPanResponderGrant: () => {
          dragStartRef.current = positionRef.current;
          didDragRef.current = true;
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: (_, gestureState) => {
          pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        },
        onPanResponderRelease: (_, gestureState) => {
          const start = dragStartRef.current;
          const rawPosition = {
            right: start.right - gestureState.dx,
            bottom: start.bottom - gestureState.dy,
          };
          const next =
            containerSize.width > 0 && containerSize.height > 0
              ? snapToNearestHorizontalEdge(rawPosition, containerSize.width, containerSize.height)
              : start;
          const snapTranslation = {
            x: start.right - next.right,
            y: start.bottom - next.bottom,
          };

          Animated.spring(pan, {
            toValue: snapTranslation,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (!finished) return;
            positionRef.current = next;
            setPosition(next);
            pan.setValue({ x: 0, y: 0 });
          });
          savePosition(next);
          didDragRef.current = false;
        },
        onPanResponderTerminate: () => {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
          didDragRef.current = false;
        },
      }),
    [containerSize.height, containerSize.width, draggable, pan, savePosition],
  );

  const handlePress = useCallback(() => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    onPress();
  }, [onPress]);

  const button = (
    <TouchableOpacity
      style={[
        styles.fab,
        draggable ? styles.fabButton : styles.fabPosition,
        !draggable && {
          bottom: Math.max(insets.bottom, Spacing.base) + Spacing.md,
        },
        { backgroundColor: colors.primary },
        Shadow.lg,
        style,
      ]}
      onPress={draggable ? handlePress : onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      {...(draggable ? panResponder.panHandlers : {})}
    >
      <Ionicons name={icon} size={26} color={colors.textOnPrimary} />
    </TouchableOpacity>
  );

  if (!draggable) {
    return button;
  }

  return (
    <View pointerEvents="box-none" style={styles.dragLayer} onLayout={handleContainerLayout}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.draggableFab,
          { right: position.right, bottom: position.bottom },
          { transform: pan.getTranslateTransform() },
        ]}
      >
        {button}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  dragLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  draggableFab: {
    position: 'absolute',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabButton: {
    position: 'relative',
  },
  fabPosition: {
    position: 'absolute',
    right: Spacing.lg,
  },
});
