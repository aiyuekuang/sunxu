import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { WorkOrder } from '../../../types/models/WorkOrder';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { CHILD_ORDER_TYPE_CONFIG, WORK_ORDER_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import type { ProductionPlanStackParamList } from '../../../host/navigation';
import { formatQtyWithUnit } from '../../../utils/qty-unit';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkOrdersSectionProps {
  workOrders: WorkOrder[];
  plannedQty: number;
  material: { unit?: string } | null | undefined;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkOrdersSection({ workOrders, plannedQty, material }: WorkOrdersSectionProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const navigation = useNavigation<NativeStackNavigationProp<ProductionPlanStackParamList>>();

  if (!workOrders || workOrders.length === 0) return null;

  // 取消工单提示
  const cancelledCount = workOrders.filter(
    (wo) => wo.status === 'cancelled' && wo.workOrderType !== 'sub_assembly',
  ).length;
  const activeWoQty = workOrders
    .filter((wo) => wo.status !== 'cancelled' && wo.workOrderType !== 'sub_assembly')
    .reduce((sum, wo) => sum + Number(wo.plannedQty), 0);
  const gap = Number(plannedQty) - activeWoQty;

  // 构建树：根工单（无 parentWorkOrderId）+ 子工单
  const rootOrders = workOrders.filter((wo) => !wo.parentWorkOrderId);
  const childMap: Record<string, WorkOrder[]> = {};
  for (const wo of workOrders) {
    if (wo.parentWorkOrderId) {
      if (!childMap[wo.parentWorkOrderId]) childMap[wo.parentWorkOrderId] = [];
      childMap[wo.parentWorkOrderId].push(wo);
    }
  }

  const renderWoItem = (wo: WorkOrder, depth: number): React.ReactElement => (
    <React.Fragment key={wo.id}>
      <TouchableOpacity
        style={[
          styles.woRow,
          { borderBottomColor: colors.border, paddingLeft: Spacing.sm + depth * 16 },
        ]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('WorkOrderDetail', { id: wo.id })}
      >
        <View style={styles.woLeft}>
          {depth > 0 && <Text style={[styles.woTreeLine, { color: colors.textMuted }]}>└ </Text>}
          <View style={styles.woInfo}>
            <View style={styles.woTopRow}>
              <Text style={[styles.woNo, { color: colors.primary }]}>{wo.orderNo}</Text>
              {wo.workOrderType && wo.workOrderType !== 'normal' && (
                <ConfigBadge value={wo.workOrderType} config={CHILD_ORDER_TYPE_CONFIG} size="sm" />
              )}
            </View>
            {wo.material?.name && (
              <Text style={[styles.woMaterial, { color: colors.textSecondary }]} numberOfLines={1}>
                {wo.material.name}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.woRight}>
          <ConfigBadge value={wo.status} config={WORK_ORDER_STATUS_CONFIG} size="sm" />
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
      {childMap[wo.id]?.map((child) => renderWoItem(child, depth + 1))}
    </React.Fragment>
  );

  return (
    <>
      {cancelledCount > 0 && (
        <View style={[styles.alertBanner, { backgroundColor: `${colors.warning}15` }]}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
          <Text style={[styles.alertText, { color: colors.textSecondary }]}>
            {cancelledCount} 个工单已取消
            {gap > 0
              ? `，剩余 ${formatQtyWithUnit(
                  gap,
                  material?.unit,
                  unitLabelMap,
                )} 投产未分配，请创建新工单`
              : ''}
          </Text>
        </View>
      )}
      <DetailCard title={`关联工单 (${workOrders.length})`}>
        {rootOrders.map((wo) => renderWoItem(wo, 0))}
      </DetailCard>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  alertText: { fontSize: FontSize.xs, flex: 1 },
  woRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
  },
  woLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 2 },
  woInfo: { flex: 1, gap: 2 },
  woTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  woNo: { fontSize: FontSize.sm, fontWeight: '500' },
  woMaterial: { fontSize: FontSize.xs },
  woTypeBadge: { paddingHorizontal: Spacing.xs, paddingVertical: 1, borderRadius: Radius.sm },
  woTypeText: { fontSize: FontSize.xs, fontWeight: '600' },
  woTreeLine: { fontSize: FontSize.sm },
  woRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
