import { StyleSheet, View } from 'react-native';
import type { ProductionPlanDetailDto } from '../../../types/models/ProductionPlanDetailDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard, StatusTag } from '../../../../core/components/DetailCard.tsx';
import { ProgressBar } from '../../../../core/components/ProgressBar.tsx';
import { PLAN_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { buildMaterialIdentitySublabel } from '../../../utils/material-identity';
import { formatQtyWithUnit } from '../../../utils/qty-unit';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanSummaryCardProps {
  plan: ProductionPlanDetailDto;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlanSummaryCard({ plan }: PlanSummaryCardProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const statusCfg = PLAN_STATUS_CONFIG[plan.status] ?? {
    label: '未知状态',
    color: '#999999',
  };
  const ratio = plan.requiredQty > 0 ? plan.completedQty / plan.requiredQty : 0;
  const isOverProduced = plan.requirementFulfilled && plan.completedQty > plan.requiredQty;
  const progressPct = Math.round(plan.completionRate ?? ratio * 100);
  const materialSubtitle = plan.material
    ? buildMaterialIdentitySublabel(plan.material, unitLabelMap)
    : '';

  const progressColor = isOverProduced
    ? colors.error
    : plan.status === 'completed'
      ? colors.success
      : colors.primary;

  return (
    <DetailCard>
      <View style={styles.summaryHeader}>
        <Text style={[styles.materialName, { color: colors.text }]} numberOfLines={1}>
          {plan.material?.name ?? '未知物料'}
        </Text>
        <StatusTag label={statusCfg.label} color={statusCfg.color} bg={statusCfg.bg ?? ''} />
      </View>
      {materialSubtitle ? (
        <Text style={[styles.materialSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
          {materialSubtitle}
        </Text>
      ) : null}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            {isOverProduced ? '超产预警' : '生产进度'}
          </Text>
          <Text style={[styles.progressPct, { color: progressColor }]}>{progressPct}%</Text>
        </View>
        <ProgressBar
          current={plan.completedQty}
          target={plan.requiredQty}
          height={6}
          // 超产/完成/进行中的语义色由业务态决定，统一传入避免归口默认色覆盖
          activeColor={progressColor}
          completedColor={progressColor}
        />
        <Text
          style={[
            styles.qtyDetail,
            { color: isOverProduced ? colors.error : colors.textSecondary },
          ]}
        >
          良品 {formatQtyWithUnit(plan.completedQty, plan.material?.unit, unitLabelMap)} /{' '}
          {formatQtyWithUnit(plan.requiredQty, plan.material?.unit, unitLabelMap)} · 投产{' '}
          {formatQtyWithUnit(plan.plannedQty, plan.material?.unit, unitLabelMap)}
        </Text>
      </View>
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  materialName: { fontSize: FontSize.md, fontWeight: '700', flex: 1 },
  materialSubtitle: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  progressSection: { gap: Spacing.xs + 2, marginTop: Spacing.sm },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: FontSize.xs },
  progressPct: { fontSize: FontSize.xs, fontWeight: '600' },
  qtyDetail: { fontSize: FontSize.xs },
});
