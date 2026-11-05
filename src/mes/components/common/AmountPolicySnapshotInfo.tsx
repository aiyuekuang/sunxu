import { StyleSheet, View, type ViewStyle } from 'react-native';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';
import {
  type AmountPolicySnapshotSummary,
  resolveAmountPolicySnapshot,
} from '../../utils/amount-policy-snapshot';
import { formatAmount } from '../../../core/utils/format';

export interface AmountPolicySnapshotInfoProps {
  /** 行价格快照或金额计算快照对象 */
  priceSnapshot?: unknown;
  /** 金额脱敏函数，传入时用于标准金额、公式差额、行金额展示 */
  mask?: (amount: string) => string;
  /** 外层布局样式 */
  style?: ViewStyle;
}

function formatVersion(snapshot: AmountPolicySnapshotSummary): string {
  return snapshot.version === null || snapshot.version === undefined
    ? '默认'
    : `v${snapshot.version}`;
}

function formatMoney(value: number | null | undefined, mask?: (amount: string) => string): string {
  if (value == null) return '-';
  const formatted = formatAmount(value);
  return mask ? mask(formatted) : formatted;
}

function formatPolicyCode(policyCode: string): string {
  return policyCode === 'default' ? '默认规则' : policyCode;
}

export function AmountPolicySnapshotInfo({
  priceSnapshot,
  mask,
  style,
}: AmountPolicySnapshotInfoProps) {
  const { colors } = useTheme();
  const snapshot = resolveAmountPolicySnapshot(priceSnapshot);

  if (!snapshot) return null;

  const versionText = formatVersion(snapshot);
  const formulaText = snapshot.amountFormulaReadable ?? snapshot.amountFormula ?? '业务数量 × 单价';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>金额计算规则</Text>
        <Text style={[styles.policy, { color: colors.text }]} numberOfLines={1}>
          {formatPolicyCode(snapshot.policyCode)} / {versionText}
        </Text>
      </View>
      <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={2}>
        行金额公式 {formulaText}
      </Text>
      <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
        标准 {formatMoney(snapshot.baseAmount, mask)} · 差额{' '}
        {formatMoney(snapshot.formulaDifferenceAmount, mask)} · 行额{' '}
        {formatMoney(snapshot.amount, mask)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  policy: {
    flex: 1,
    textAlign: 'right',
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  meta: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs + 5,
  },
});
