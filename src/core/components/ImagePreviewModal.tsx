import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Image, Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HIT_SLOP, MIN_TOUCH_TARGET, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImagePreviewModalProps {
  /** 是否显示图片预览弹层 */
  visible: boolean;
  /** 当前预览图片 URL；支持远程 URL 和本地 file URI */
  uri?: string | null;
  /** 关闭预览弹层 */
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.2;
const SPRING_CONFIG = { damping: 18, stiffness: 180 };

function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

function getMaxTranslate(containerSize: number, currentScale: number): number {
  'worklet';
  return Math.max(0, (containerSize * currentScale - containerSize) / 2);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ImagePreviewModal({ visible, uri, onClose }: ImagePreviewModalProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(MIN_SCALE);
  const savedScale = useSharedValue(MIN_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const lastResetKeyRef = useRef('');

  useEffect(() => {
    const nextResetKey = `${visible ? 'open' : 'closed'}:${uri ?? ''}:${width}:${height}`;
    if (lastResetKeyRef.current === nextResetKey) return;
    lastResetKeyRef.current = nextResetKey;

    scale.value = MIN_SCALE;
    savedScale.value = MIN_SCALE;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [
    height,
    savedScale,
    savedTranslateX,
    savedTranslateY,
    scale,
    translateX,
    translateY,
    uri,
    visible,
    width,
  ]);

  const resetImage = () => {
    'worklet';
    scale.value = withSpring(MIN_SCALE, SPRING_CONFIG);
    savedScale.value = MIN_SCALE;
    translateX.value = withSpring(0, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const nextScale = clamp(savedScale.value * event.scale, MIN_SCALE, MAX_SCALE);
      scale.value = nextScale;

      const maxX = getMaxTranslate(width, nextScale);
      const maxY = getMaxTranslate(height, nextScale);
      translateX.value = clamp(translateX.value, -maxX, maxX);
      translateY.value = clamp(translateY.value, -maxY, maxY);
    })
    .onEnd(() => {
      if (scale.value <= MIN_SCALE + 0.02) {
        resetImage();
        return;
      }

      const maxX = getMaxTranslate(width, scale.value);
      const maxY = getMaxTranslate(height, scale.value);
      const nextX = clamp(translateX.value, -maxX, maxX);
      const nextY = clamp(translateY.value, -maxY, maxY);

      savedScale.value = scale.value;
      savedTranslateX.value = nextX;
      savedTranslateY.value = nextY;
      translateX.value = withSpring(nextX, SPRING_CONFIG);
      translateY.value = withSpring(nextY, SPRING_CONFIG);
    });

  const panGesture = Gesture.Pan()
    .minDistance(2)
    .onUpdate((event) => {
      if (scale.value <= MIN_SCALE) return;

      const maxX = getMaxTranslate(width, scale.value);
      const maxY = getMaxTranslate(height, scale.value);
      translateX.value = clamp(savedTranslateX.value + event.translationX, -maxX, maxX);
      translateY.value = clamp(savedTranslateY.value + event.translationY, -maxY, maxY);
    })
    .onEnd(() => {
      if (scale.value <= MIN_SCALE) {
        resetImage();
        return;
      }

      const maxX = getMaxTranslate(width, scale.value);
      const maxY = getMaxTranslate(height, scale.value);
      savedTranslateX.value = clamp(translateX.value, -maxX, maxX);
      savedTranslateY.value = clamp(translateY.value, -maxY, maxY);
      translateX.value = withSpring(savedTranslateX.value, SPRING_CONFIG);
      translateY.value = withSpring(savedTranslateY.value, SPRING_CONFIG);
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_event, success) => {
      if (!success) return;
      if (scale.value > MIN_SCALE) {
        resetImage();
        return;
      }

      scale.value = withSpring(DOUBLE_TAP_SCALE, SPRING_CONFIG);
      savedScale.value = DOUBLE_TAP_SCALE;
      translateX.value = withSpring(0, SPRING_CONFIG);
      translateY.value = withSpring(0, SPRING_CONFIG);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);
  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
        <View style={styles.backdrop}>
          {uri ? (
            <GestureDetector gesture={composedGesture}>
              <Animated.View style={[styles.imageFrame, animatedImageStyle]}>
                <Image
                  source={{ uri }}
                  style={[styles.image, { width, height }]}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
              </Animated.View>
            </GestureDetector>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="关闭图片预览"
            hitSlop={HIT_SLOP}
            style={[
              styles.closeButton,
              {
                top: insets.top + Spacing.md,
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                borderColor: 'rgba(255, 255, 255, 0.28)',
              },
            ]}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={colors.textOnPrimary} />
          </Pressable>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
  },
  imageFrame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    flexShrink: 0,
  },
  closeButton: {
    position: 'absolute',
    right: Spacing.md,
    zIndex: 1,
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
