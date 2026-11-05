import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { ReportPolicyDisclosure } from './ReportPolicyDisclosure.tsx';

interface ReportDashboardHeaderProps {
  policyItems: string[];
  warnings?: string[];
}

export function ReportDashboardHeader({ policyItems, warnings }: ReportDashboardHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>经营驾驶舱</Text>
      <ReportPolicyDisclosure items={policyItems} warnings={warnings} />
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
  title: { fontSize: FontSize.lg, fontWeight: '700' },
});
