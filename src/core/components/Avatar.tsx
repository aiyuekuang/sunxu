import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { FontSize, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { getNameInitial } from '../utils/format';

export interface AvatarProps {
  /** Image URL. An empty, missing, or failed URL falls back to the name initial. */
  uri?: string | null;
  /** Name used for the visual fallback and default accessible name. */
  name?: string | null;
  /** Visible circle diameter in logical pixels. Defaults to 48. */
  size?: number;
  /** Optional host-owned action, such as opening its avatar picker. */
  onPress?: () => void;
  /** Override the screen-reader name when the host action needs more context. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  /** Shows an upload overlay and announces a busy state while the host is working. */
  isLoading?: boolean;
  /** Outer layout style; use this for placement, not to replace avatar geometry. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Theme-aware avatar display with a resilient initial fallback and optional host action. */
export function Avatar({
  uri,
  name,
  size = 48,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  isLoading = false,
  style,
  testID,
}: AvatarProps) {
  const { colors, isDark } = useTheme();
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const canShowImage = Boolean(uri) && failedUri !== uri;
  const isDisabled = disabled || isLoading;
  const targetSize = Math.max(
    size,
    MIN_TOUCH_TARGET,
    MIN_TOUCH_TARGET_ANDROID,
  );
  const trimmedName = name?.trim() || '';
  const resolvedLabel = accessibilityLabel ?? (
    onPress
      ? `更换${trimmedName ? `${trimmedName}的` : ''}头像`
      : `${trimmedName || '用户'}头像`
  );

  const face = (
    <View
      style={[
        styles.face,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primarySurface,
          borderColor: colors.border,
          opacity: disabled && !isLoading ? 0.55 : 1,
        },
      ]}
      pointerEvents="none"
    >
      {canShowImage ? (
        <Image
          source={{ uri: uri as string }}
          resizeMode="cover"
          onError={() => setFailedUri(uri ?? null)}
          accessible={false}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <AppText
          accessible={false}
          allowFontScaling={false}
          style={[
            styles.initial,
            {
              color: isDark ? colors.text : colors.primary,
              fontSize: Math.max(FontSize.base, size * 0.4),
              lineHeight: size,
            },
          ]}
        >
          {getNameInitial(name)}
        </AppText>
      )}
      {isLoading ? (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.overlay }]}>
          <ActivityIndicator size="small" color={colors.textOnPrimary} />
        </View>
      ) : null}
    </View>
  );

  if (!onPress) {
    return (
      <View
        testID={testID}
        style={[styles.staticTarget, { width: size, height: size }, style]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={resolvedLabel}
        accessibilityState={{ busy: isLoading }}
        aria-busy={isLoading}
      >
        {face}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      style={({ pressed }) => [
        styles.pressTarget,
        { width: targetSize, height: targetSize },
        pressed && !isDisabled ? styles.pressed : null,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={resolvedLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      aria-busy={isLoading}
    >
      {face}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  staticTarget: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressTarget: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  initial: {
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.76,
  },
});
