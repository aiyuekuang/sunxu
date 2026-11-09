import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export interface ScalePressableProps extends Omit<PressableProps, 'style' | 'onPressIn' | 'onPressOut'> {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  onPressIn?: (event: GestureResponderEvent) => void;
  onPressOut?: (event: GestureResponderEvent) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRESS_IN_EASING = Easing.bezier(0.23, 1, 0.32, 1);
const PRESS_OUT_EASING = Easing.bezier(0.2, 0.8, 0.2, 1);

/** Pressable with a restrained scale response that respects Reduce Motion. */
export function ScalePressable({
  children,
  style,
  scaleTo = 0.97,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: ScalePressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const [pressed, setPressed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
      animationRef.current?.stop();
    };
  }, []);

  const animateTo = useCallback(
    (toValue: number, duration: number, easing: (value: number) => number) => {
      animationRef.current?.stop();
      animationRef.current = null;
      if (reduceMotion) {
        scale.setValue(1);
        return;
      }
      const animation = Animated.timing(scale, {
        toValue,
        duration,
        easing,
        useNativeDriver: true,
      });
      animationRef.current = animation;
      animation.start(({ finished }) => {
        if (animationRef.current !== animation) return;
        animationRef.current = null;
        if (finished) scale.setValue(toValue);
      });
    },
    [reduceMotion, scale],
  );

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (!disabled) {
        setPressed(true);
        animateTo(scaleTo, 100, PRESS_IN_EASING);
      }
      onPressIn?.(event);
    },
    [animateTo, disabled, onPressIn, scaleTo],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      setPressed(false);
      animateTo(1, 160, PRESS_OUT_EASING);
      onPressOut?.(event);
    },
    [animateTo, onPressOut],
  );

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, !disabled && pressed ? { opacity: 0.92 } : null, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}
