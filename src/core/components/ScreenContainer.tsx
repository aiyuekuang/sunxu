import type React from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { PageHeader } from './PageHeader.tsx';

export type ScreenScrollMode = 'none' | 'scroll' | 'keyboard';

export interface ScreenContainerProps {
  /** Fixed content above the screen body, such as a page header. */
  header?: React.ReactNode;
  /** Fixed content below the screen body, such as a bottom action bar. */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Use `scroll` for read-only content and `keyboard` for editable forms. */
  scrollMode?: ScreenScrollMode;
  /** The bottom edge is opt-in so BottomActionBar can own its own inset. */
  safeAreaEdges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/** Shared page frame with stable header, body, footer and safe-area ownership. */
export function ScreenContainer({
  header,
  footer,
  children,
  scrollMode = 'none',
  safeAreaEdges = ['top', 'left', 'right'],
  style,
  contentContainerStyle,
}: ScreenContainerProps) {
  const { colors } = useTheme();
  const body =
    scrollMode === 'keyboard' ? (
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        {children}
      </KeyboardAwareScrollView>
    ) : scrollMode === 'scroll' ? (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    ) : (
      <View style={[styles.flex, contentContainerStyle]}>{children}</View>
    );

  return (
    <SafeAreaView
      edges={safeAreaEdges}
      style={[styles.safeArea, { backgroundColor: colors.background }, style]}
    >
      {header}
      {body}
      {footer}
    </SafeAreaView>
  );
}

export interface TitledScreenContainerProps extends Omit<ScreenContainerProps, 'header'> {
  title: string;
  onBack?: () => void;
  headerRight?: React.ReactNode;
}

/** Detail-page layout: a safe header, scrollable content and an optional fixed footer. */
export function DetailScreenContainer({
  title,
  onBack,
  headerRight,
  ...screenProps
}: TitledScreenContainerProps) {
  return (
    <ScreenContainer
      {...screenProps}
      scrollMode={screenProps.scrollMode ?? 'scroll'}
      header={<PageHeader title={title} onBack={onBack} right={headerRight} noSafeArea />}
    />
  );
}

export interface ListScreenContainerProps extends Omit<ScreenContainerProps, 'header' | 'scrollMode'> {
  title: string;
  onBack?: () => void;
  headerRight?: React.ReactNode;
  /** Search, tabs and filters stay directly above the results they control. */
  toolbar?: React.ReactNode;
}

/** List-page layout keeps the search/filter toolbar adjacent to the result area. */
export function ListScreenContainer({
  title,
  onBack,
  headerRight,
  toolbar,
  children,
  footer,
  safeAreaEdges,
  style,
  contentContainerStyle,
}: ListScreenContainerProps) {
  const { colors } = useTheme();

  return (
    <ScreenContainer
      header={<PageHeader title={title} onBack={onBack} right={headerRight} noSafeArea />}
      footer={footer}
      safeAreaEdges={safeAreaEdges}
      style={style}
      contentContainerStyle={contentContainerStyle}
    >
      {toolbar ? (
        <View
          style={[
            styles.toolbar,
            { backgroundColor: colors.surface, borderBottomColor: colors.border },
          ]}
        >
          {toolbar}
        </View>
      ) : null}
      <View style={styles.flex}>{children}</View>
    </ScreenContainer>
  );
}

export function FormScreenContainer(props: TitledScreenContainerProps) {
  const { scrollMode, ...screenProps } = props;
  return <DetailScreenContainer {...screenProps} scrollMode={scrollMode ?? 'keyboard'} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1, minHeight: 0 },
  scrollContent: { flexGrow: 1, padding: Spacing.md, gap: Spacing.sm },
  toolbar: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
