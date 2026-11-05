import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { Radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = Radius.sm,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [anim]);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] });

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: colors.skeleton, opacity }, style]}
    />
  );
}

// 常用的预设排列
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, style]}>
      <View style={styles.row}>
        <Skeleton width={120} height={14} />
        <Skeleton width={60} height={20} borderRadius={Radius.full} />
      </View>
      <Skeleton height={12} style={{ marginTop: 10 }} />
      <Skeleton width="70%" height={12} style={{ marginTop: 6 }} />
    </View>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no unique id
        <SkeletonCard key={`skeleton-${i}`} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  list: {
    gap: 10,
    padding: 16,
  },
});
