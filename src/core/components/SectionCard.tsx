import type React from 'react';
import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

export interface SectionCardProps {
  /** Only include a visible heading when it adds context beyond the page and its controls. */
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  required?: boolean;
  headerRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
}

/**
 * Groups related content on one surface. A heading is optional: omit it when the
 * page context or adjacent controls already identify the content.
 */
export function SectionCard({
  title,
  subtitle,
  children,
  required = false,
  headerRight,
  style,
  bodyStyle,
  headerStyle,
  titleStyle,
  subtitleStyle,
}: SectionCardProps) {
  const { colors } = useTheme();
  const showHeader = Boolean(title || subtitle || headerRight);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {showHeader ? (
        <View style={[styles.header, headerStyle]}>
          {title || subtitle ? (
            <View style={styles.headerMain}>
              {title ? (
                <AppText style={[styles.title, { color: colors.text }, titleStyle]}>
                  {title}{required ? <AppText style={{ color: colors.error }}> *</AppText> : null}
                </AppText>
              ) : null}
              {subtitle ? (
                <AppText
                  style={[
                    styles.subtitle,
                    !title && styles.subtitleWithoutTitle,
                    { color: colors.textSecondary },
                    subtitleStyle,
                  ]}
                >
                  {subtitle}
                </AppText>
              ) : null}
            </View>
          ) : null}
          {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
        </View>
      ) : null}
      <View style={[styles.body, showHeader && styles.bodyWithHeader, bodyStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  headerMain: { flex: 1, minWidth: 0 },
  headerRight: { flexShrink: 0, justifyContent: 'center' },
  title: { fontSize: FontSize.base, lineHeight: 22, fontWeight: '700' },
  subtitle: { marginTop: Spacing.xs, fontSize: FontSize.xs, lineHeight: 18 },
  subtitleWithoutTitle: { marginTop: 0 },
  body: { gap: Spacing.sm },
  bodyWithHeader: { marginTop: Spacing.xs },
});
