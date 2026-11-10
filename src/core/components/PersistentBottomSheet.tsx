import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import type React from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface PersistentBottomSheetRef {
  /** Expand to the last configured snap point. */
  expand: () => void;
  /** Close to index -1. */
  close: () => void;
  /** Move to a configured snap point. */
  snapToIndex: (index: number) => void;
}

export interface PersistentBottomSheetProps {
  children: React.ReactNode;
  index: number;
  snapPoints: Array<number | string>;
  onChange?: (index: number) => void;
  bottomInset?: number;
  enablePanDownToClose?: boolean;
  enableContentPanningGesture?: boolean;
  /** Layout owned by the sheet host, such as an action panel's internal padding. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Use for a screen-specific surface treatment while retaining Sunxu defaults. */
  sheetStyle?: StyleProp<ViewStyle>;
  /** Optional handle treatment; the default uses the current theme border color. */
  handleStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Theme-aware non-modal sheet for persistent tools such as a call dialer.
 * Use `BottomSheet` for temporary modal tasks that need a backdrop and a header.
 */
export const PersistentBottomSheet = forwardRef<
  PersistentBottomSheetRef,
  PersistentBottomSheetProps
>(function PersistentBottomSheet(
  {
    children,
    index,
    snapPoints,
    onChange,
    bottomInset = 0,
    enablePanDownToClose = true,
    enableContentPanningGesture = true,
    contentStyle,
    sheetStyle,
    handleStyle,
    testID,
  },
  ref,
) {
  const { colors } = useTheme();
  const sheetRef = useRef<React.ComponentRef<typeof BottomSheet>>(null);

  useImperativeHandle(
    ref,
    () => ({
      expand: () => sheetRef.current?.expand(),
      close: () => sheetRef.current?.close(),
      snapToIndex: (nextIndex) => sheetRef.current?.snapToIndex(nextIndex),
    }),
    [],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={index}
      snapPoints={snapPoints}
      onChange={onChange}
      bottomInset={bottomInset}
      enablePanDownToClose={enablePanDownToClose}
      enableContentPanningGesture={enableContentPanningGesture}
      backgroundStyle={[
        styles.sheet,
        { backgroundColor: colors.surface },
        sheetStyle,
      ]}
      handleIndicatorStyle={[
        styles.handle,
        { backgroundColor: colors.border },
        handleStyle,
      ]}
    >
      <BottomSheetView testID={testID} style={[styles.content, contentStyle]}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
});

PersistentBottomSheet.displayName = 'PersistentBottomSheet';

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  handle: { width: 40 },
  content: { flex: 1, paddingHorizontal: Spacing.md },
});
