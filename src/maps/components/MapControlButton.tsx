import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { MIN_TOUCH_TARGET, Radius, Shadow, Spacing } from '../../core/theme/tokens';
import { useTheme } from '../../core/theme/useTheme';

export interface MapControlButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** 48dp floating map control with standard disabled and loading feedback. */
export function MapControlButton({
  icon,
  accessibilityLabel,
  onPress,
  disabled,
  loading,
  style,
}: MapControlButtonProps) {
  const { colors } = useTheme();
  const unavailable = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={unavailable}
      style={({ pressed }) => [
        styles.button,
        Shadow.md,
        { backgroundColor: colors.surface, opacity: unavailable ? 0.58 : pressed ? 0.76 : 1 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      hitSlop={4}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Ionicons name={icon} size={22} color={colors.text} />
      )}
    </Pressable>
  );
}

export function MapControlStack({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.stack, style]}>{children}</View>;
}

/** Ready-made zoom controls; camera behavior remains owned by the provider adapter. */
export function MapZoomControls({
  onZoomIn,
  onZoomOut,
  zoomInDisabled,
  zoomOutDisabled,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomInDisabled?: boolean;
  zoomOutDisabled?: boolean;
}) {
  return (
    <MapControlStack>
      <MapControlButton
        icon="add"
        accessibilityLabel="放大地图"
        onPress={onZoomIn}
        disabled={zoomInDisabled}
      />
      <MapControlButton
        icon="remove"
        accessibilityLabel="缩小地图"
        onPress={onZoomOut}
        disabled={zoomOutDisabled}
      />
    </MapControlStack>
  );
}

const styles = StyleSheet.create({
  button: {
    width: MIN_TOUCH_TARGET + 4,
    height: MIN_TOUCH_TARGET + 4,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: { gap: Spacing.sm, alignItems: 'center' },
});
