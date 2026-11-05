import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ProgressBar } from '../../../../core/components/ProgressBar.tsx';
import { PLAN_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateStr } from '../../../../core/utils/date';
import { formatQtyWithUnit, formatUnitLabel } from '../../../utils/qty-unit';
import type { PlanWithWorkOrders } from '../types';
import { isFinishedWorkOrderStatus } from '../status-utils';
import { WorkOrderOperationList } from './WorkOrderOperationList.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanProgressCardProps {
  plan: PlanWithWorkOrders;
  expanded: boolean;
  onToggle: () => void;
  onWorkOrderPress: (workOrderId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PlanProgressCard = React.memo(function PlanProgressCard({
  plan,
  expanded,
  onToggle,
  onWorkOrderPress,
}: PlanProgressCardProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');

  const progressPct = useMemo(
    () =>
      plan.requiredQty > 0
        ? Math.min(Math.round((plan.completedQty / plan.requiredQty) * 100), 100)
        : 0,
    [plan.completedQty, plan.requiredQty],
  );

  const woStats = useMemo(() => {
    const total = plan.workOrders?.length ?? 0;
    const completed =
      plan.workOrders?.filter((wo) => isFinishedWorkOrderStatus(wo.status)).length ?? 0;
    return { total, completed };
  }, [plan.workOrders]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, Shadow.sm]}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7} style={styles.header}>
        {/* 第一行：计划号 + 状态 */}
        <View style={styles.topRow}>
          <Text style={[styles.planNo, { color: colors.textSecondary }]}>{plan.planNo}</Text>
          <ConfigBadge value={plan.status} config={PLAN_STATUS_CONFIG} size="sm" />
        </View>

        {/* 产品名 */}
        <Text style={[styles.materialName, { color: colors.text }]} numberOfLines={1}>
          {plan.material?.name ?? '未知物料'}
        </Text>

        {/* 进度条 */}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              良品 {formatQtyWithUnit(plan.completedQty, plan.material?.unit, unitLabelMap)} /{' '}
              {formatQtyWithUnit(plan.requiredQty, plan.material?.unit, unitLabelMap)}
            </Text>
            <Text
              style={[
                styles.progressPct,
                { color: progressPct >= 100 ? colors.success : colors.primary },
              ]}
            >
              {progressPct}%
            </Text>
          </View>
          <ProgressBar current={plan.completedQty} target={plan.requiredQty} />
        </View>

        {/* 底部：工单统计 + 展开箭头 */}
        <View style={styles.bottomRow}>
          <Text style={[styles.woMeta, { color: colors.textMuted }]}>
            工单 {woStats.completed}/{woStats.total}
            {plan.dueDate ? `  ·  交期 ${formatDateStr(plan.dueDate)}` : ''}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* 展开区域：工单 + 工序进度 */}
      {expanded && plan.workOrders && plan.workOrders.length > 0 && (
        <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
          <WorkOrderOperationList
            workOrders={plan.workOrders}
            materialUnit={formatUnitLabel(plan.material?.unit, unitLabelMap)}
            onWorkOrderPress={onWorkOrderPress}
          />
        </View>
      )}

      {expanded && (!plan.workOrders || plan.workOrders.length === 0) && (
        <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>暂无关联工单</Text>
        </View>
      )}
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  header: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planNo: { fontSize: FontSize.xs, fontWeight: '500' },
  materialName: { fontSize: FontSize.base, fontWeight: '600' },
  progressSection: { gap: Spacing.xs },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: { fontSize: FontSize.xs },
  progressPct: { fontSize: FontSize.xs, fontWeight: '600' },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  woMeta: { fontSize: FontSize.xs },
  expandedSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  emptyText: { fontSize: FontSize.xs, textAlign: 'center', paddingVertical: Spacing.sm },
});
