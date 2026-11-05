import { StyleSheet, View } from 'react-native';
import type { ProductionPlanDetailDto } from '../../../types/models/ProductionPlanDetailDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber } from '../../../../core/utils/format';

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * 计划需求明细 / 计划批次 轻量摘要（App 端只读展示，写入仍在 PC/工单链路）。
 * demandLines / releaseLines 由计划详情返回，状态中文标签直接消费后端 statusLabel。
 */
export function PlanDemandBatchSection({ plan }: { plan: ProductionPlanDetailDto }) {
  const { colors } = useTheme();
  const demandLines = plan.demandLines ?? [];
  const releaseLines = plan.releaseLines ?? [];
  if (demandLines.length === 0 && releaseLines.length === 0) return null;

  return (
    <>
      {demandLines.length > 0 && (
        <DetailCard title={`需求明细 (${demandLines.length})`}>
          {demandLines.map((line) => (
            <View key={line.id} style={[styles.row, { borderBottomColor: colors.border }]}>
              <View style={styles.left}>
                <Text style={[styles.title, { color: colors.textSecondary }]} numberOfLines={1}>
                  {line.sourceOrderNo ||
                    (line.sourceType === 'direct_plan' ? '直接计划' : line.sourceType)}
                </Text>
                {line.material?.name ? (
                  <Text style={[styles.sub, { color: colors.textMuted }]} numberOfLines={1}>
                    {line.material.name}
                  </Text>
                ) : null}
                {line.sourceRemarkSnapshot ? (
                  <Text style={[styles.sub, { color: colors.textMuted }]}>
                    来源备注：{line.sourceRemarkSnapshot}
                  </Text>
                ) : null}
              </View>
              <View style={styles.right}>
                <Text style={[styles.qty, { color: colors.textSecondary }]}>
                  {formatNumber(line.fulfilledQty)}/{formatNumber(line.productionRequiredQty)}
                </Text>
                <Text style={[styles.status, { color: colors.textMuted }]}>{line.statusLabel}</Text>
              </View>
            </View>
          ))}
        </DetailCard>
      )}
      {releaseLines.length > 0 && (
        <DetailCard title={`计划批次 (${releaseLines.length})`}>
          {releaseLines.map((line) => (
            <View key={line.id} style={[styles.row, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.primary }]} numberOfLines={1}>
                {line.releaseNo}
              </Text>
              <View style={styles.right}>
                <Text style={[styles.qty, { color: colors.textSecondary }]}>
                  投产 {formatNumber(line.plannedQty)}
                </Text>
                <Text style={[styles.status, { color: colors.textMuted }]}>{line.statusLabel}</Text>
              </View>
            </View>
          ))}
        </DetailCard>
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
  },
  left: { flex: 1, gap: 2 },
  title: { fontSize: FontSize.sm, fontWeight: '500' },
  sub: { fontSize: FontSize.xs },
  right: { alignItems: 'flex-end', gap: 2 },
  qty: { fontSize: FontSize.sm },
  status: { fontSize: FontSize.xs },
});
