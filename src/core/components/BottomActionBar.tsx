import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

interface BottomActionBarProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderTopColor?: string;
  bottomInsetBase?: number;
  includeSafeArea?: boolean;
}

export function BottomActionBar({
  children,
  style,
  backgroundColor,
  borderTopColor,
  bottomInsetBase = Spacing.sm,
  includeSafeArea = true,
}: BottomActionBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor ?? colors.surface,
          borderTopColor: borderTopColor ?? colors.border,
          paddingBottom: includeSafeArea
            ? Math.max(insets.bottom, bottomInsetBase)
            : bottomInsetBase,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
