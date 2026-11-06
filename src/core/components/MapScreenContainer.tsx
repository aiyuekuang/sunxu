import type React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface MapScreenContainerProps {
  /** Provider-specific map view. It should fill the available canvas. */
  children: React.ReactNode;
  /** Optional title/header placed above the map controls. */
  header?: React.ReactNode;
  /** Floating controls aligned to the top leading/trailing corners. */
  topLeading?: React.ReactNode;
  topTrailing?: React.ReactNode;
  /** Floating content aligned to the bottom corners. */
  bottomLeading?: React.ReactNode;
  bottomTrailing?: React.ReactNode;
  /** Full-width content above the bottom corner controls. */
  footer?: React.ReactNode;
  /** Keep overlay content clear of system bars. Disable when embedded in a safe-area page. */
  safeArea?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** Full-bleed map canvas with safe-area-aware overlay slots and no map-provider dependency. */
export function MapScreenContainer({
  children,
  header,
  topLeading,
  topTrailing,
  bottomLeading,
  bottomTrailing,
  footer,
  safeArea = true,
  testID,
  style,
}: MapScreenContainerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const hasTop = header || topLeading || topTrailing;
  const hasBottom = footer || bottomLeading || bottomTrailing;

  return (
    <View testID={testID} style={[styles.root, { backgroundColor: colors.background }, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {children}
      </View>

      <View style={styles.overlay} pointerEvents="box-none">
        {hasTop ? (
          <View
            style={[
              styles.topArea,
              { paddingTop: (safeArea ? insets.top : 0) + Spacing.md },
            ]}
            pointerEvents="box-none"
          >
            {header}
            {topLeading || topTrailing ? (
              <View style={styles.topRow} pointerEvents="box-none">
                <View style={styles.slot} pointerEvents="box-none">{topLeading}</View>
                <View style={styles.slot} pointerEvents="box-none">{topTrailing}</View>
              </View>
            ) : null}
          </View>
        ) : null}

        {hasBottom ? (
          <View
            style={[
              styles.bottomArea,
              { paddingBottom: (safeArea ? insets.bottom : 0) + Spacing.md },
            ]}
            pointerEvents="box-none"
          >
            {footer}
            {bottomLeading || bottomTrailing ? (
              <View style={styles.bottomRow} pointerEvents="box-none">
                <View style={styles.slot} pointerEvents="box-none">{bottomLeading}</View>
                <View style={styles.slot} pointerEvents="box-none">{bottomTrailing}</View>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minHeight: 0, position: 'relative', overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topArea: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bottomArea: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  slot: { flexShrink: 1 },
});
