import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface ReportSectionHeaderProps {
  testID?: string;
  title: string;
  hint?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ReportSectionHeader({
  testID,
  title,
  hint,
  action,
  style,
}: ReportSectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View testID={testID} style={[styles.container, style]}>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {hint ? <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  copy: { flex: 1, minWidth: 0, gap: Spacing.xs },
  title: { fontSize: FontSize.base, fontWeight: '700' },
  hint: { fontSize: FontSize.xs },
});
