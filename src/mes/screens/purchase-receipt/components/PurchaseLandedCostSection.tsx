import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { PurchaseLandedCost } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { DetailCard, InfoRow } from '../../../../core/components/DetailCard.tsx';
import { PURCHASE_LANDED_COST_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { getReceiptLandedCostAllocationSummary } from './purchase-landed-cost-section.logic.ts';

interface PurchaseLandedCostSectionProps {
  readonly landedCosts: PurchaseLandedCost[];
  readonly loading: boolean;
  readonly hasError: boolean;
  readonly onRetry: () => void;
  readonly maskAmount: (value: string) => string;
}

/** 采购入库详情的只读分摊结果；录入和状态动作统一在 PC 分摊单主流程。 */
export function PurchaseLandedCostSection({
  landedCosts,
  loading,
  hasError,
  onRetry,
  maskAmount,
}: PurchaseLandedCostSectionProps) {
  const { colors } = useTheme();

  return (
    <DetailCard title="采购附加费用分摊">
      {loading ? (
        <InfoRow label="分摊结果" value="加载中" last />
      ) : hasError ? (
        <InfoRow
          label="分摊结果"
          last
          right={
            <TouchableOpacity onPress={onRetry}>
              <Text style={[styles.linkText, { color: colors.primary }]}>加载失败，重试</Text>
            </TouchableOpacity>
          }
        />
      ) : landedCosts.length === 0 ? (
        <InfoRow label="分摊结果" value="暂无已关联分摊单" last />
      ) : (
        landedCosts.map((landedCost, index) => {
          const allocationSummary = getReceiptLandedCostAllocationSummary(landedCost);
          const hasAllocatedTax = allocationSummary.allocatedTaxAmount !== 0;

          return (
            <View
              key={landedCost.id}
              style={[
                styles.row,
                index < landedCosts.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.main}>
                <Text style={[styles.costNo, { color: colors.text }]}>{landedCost.costNo}</Text>
                <Text style={[styles.detail, { color: colors.textSecondary }]}>
                  承运方：{landedCost.carrier?.name ?? '-'}
                </Text>
                <Text style={[styles.detail, { color: colors.textSecondary }]}>
                  物流应付/贷项：{landedCost.financeInvoice?.invoiceNo ?? '-'}
                </Text>
                {hasAllocatedTax ? (
                  <Text style={[styles.detail, { color: colors.textSecondary }]}>
                    本单税额：
                    {maskAmount(
                      `${landedCost.currency} ${allocationSummary.allocatedTaxAmount.toFixed(2)}`,
                    )}
                  </Text>
                ) : null}
              </View>
              <View style={styles.right}>
                <ConfigBadge
                  value={landedCost.status}
                  config={PURCHASE_LANDED_COST_STATUS_CONFIG}
                  size="sm"
                />
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
                  本单成本分摊
                </Text>
                <Text style={[styles.amount, { color: colors.text }]}>
                  {maskAmount(
                    `${landedCost.currency} ${allocationSummary.allocatedAmount.toFixed(2)}`,
                  )}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  main: { flex: 1, gap: 2 },
  costNo: { fontSize: FontSize.sm, fontWeight: '600' },
  detail: { fontSize: FontSize.sm },
  right: { alignItems: 'flex-end', gap: Spacing.xs },
  amountLabel: { fontSize: FontSize.sm },
  amount: { fontSize: FontSize.sm, fontWeight: '600' },
  linkText: { fontSize: FontSize.sm, fontWeight: '600' },
});
