import type React from 'react';
import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

export interface SectionCardProps {
  title: string;
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

/** A titled content section with optional supporting text and trailing actions. */
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
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerMain}>
          <AppText style={[styles.title, { color: colors.text }, titleStyle]}>
            {title}{required ? <AppText style={{ color: colors.error }}> *</AppText> : null}
          </AppText>
          {subtitle ? <AppText style={[styles.subtitle, { color: colors.textSecondary }, subtitleStyle]}>{subtitle}</AppText> : null}
        </View>
        {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
      </View>
      <View style={[styles.body, bodyStyle]}>{children}</View>
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
  body: { marginTop: Spacing.xs, gap: Spacing.sm },
});
