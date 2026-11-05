import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { CapacityDayDto } from '../../../types/models/CapacityDayDto';
import type { CapacityWorkCenterDto } from '../../../types/models/CapacityWorkCenterDto';
import type { DashboardCockpitResponseDto } from '../../../types/models/DashboardCockpitResponseDto';
import type { OrderProgressItemDto } from '../../../types/models/OrderProgressItemDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { WORK_ORDER_DISPLAY_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, MIN_TOUCH_TARGET, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime, formatShortDate, parseDate } from '../../../../core/utils/date';
import { formatCompactNumber, formatNumber } from '../../../../core/utils/format';
import { ReportDonutChart } from './ReportDonutChart.tsx';
import { ReportSectionHeader } from './ReportSectionHeader.tsx';

interface DashboardProductionSectionsProps {
  cockpit: DashboardCockpitResponseDto;
  onOpenStatus: (status: string) => void;
  onOpenWorkCenter: (workCenterId: string, workCenterName: string) => void;
  onOpenOrder: (order: OrderProgressItemDto) => void;
}

const STATUS_ORDER = [
  'unscheduled',
  'pending_confirm',
  'ready_to_start',
  'in_progress',
  'paused',
  'draft',
  'submitted',
  'completed',
  'closed',
  'cancelled',
];

function clampPercent(value: number): number {
  return Math.min(Math.max(Number(value) || 0, 0), 100);
}

function WorkOrderStatusCard({
  cockpit,
  onOpenStatus,
}: Pick<DashboardProductionSectionsProps, 'cockpit' | 'onOpenStatus'>) {
  const { colors } = useTheme();
  const summary = cockpit.workOrderStatus.summary;
  const rows = Object.entries(summary.byStatus ?? {})
    .filter(([, value]) => Number(value.count ?? 0) > 0)
    .sort(
      ([left], [right]) =>
        (STATUS_ORDER.indexOf(left) === -1 ? STATUS_ORDER.length : STATUS_ORDER.indexOf(left)) -
        (STATUS_ORDER.indexOf(right) === -1 ? STATUS_ORDER.length : STATUS_ORDER.indexOf(right)),
    );
  const donutItems = rows.map(([status, value]) => {
    const config = WORK_ORDER_DISPLAY_STATUS_CONFIG[status];
    return {
      id: status,
      label: config?.label ?? '未知状态',
      value: Number(value.count ?? 0),
      color: config?.color ?? colors.primary,
    };
  });

  return (
    <>
      <ReportSectionHeader
        title="工单状态"
        hint={
          cockpit.workOrderStatus.scope === 'current_flow'
            ? '当前生产流转'
            : '期间新建工单的当前状态'
        }
      />
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {donutItems.length > 0 ? (
          <ReportDonutChart
            items={donutItems}
            centerLabel="工单"
            centerValue={summary.total}
            accessibilityLabel={`当前工单状态分布，共 ${summary.total} 个工单`}
            onPressItem={onOpenStatus}
          />
        ) : (
          <EmptyState compact icon="layers-outline" title="当前范围暂无工单状态数据" />
        )}
      </View>
    </>
  );
}

interface CapacitySummary {
  id: string;
  name: string;
  capacity: CapacityDayDto[];
  averageRate: number;
  peakRate: number;
  overloadDays: number;
  unavailableEquipment: number;
}

function summarizeCapacity(item: CapacityWorkCenterDto): CapacitySummary {
  const rates = item.capacity.map((day) => Number(day.utilizationRate ?? 0) * 100);
  const totalRate = rates.reduce((sum, value) => sum + value, 0);
  return {
    id: item.id,
    name: item.name,
    capacity: item.capacity,
    averageRate: rates.length > 0 ? totalRate / rates.length : 0,
    peakRate: rates.length > 0 ? Math.max(...rates) : 0,
    overloadDays: rates.filter((value) => value > 100).length,
    unavailableEquipment: item.capacity.reduce(
      (max, day) => Math.max(max, Number(day.unavailableEquipmentCount ?? 0)),
      0,
    ),
  };
}

function capacityCellColor(rate: number, colors: ReturnType<typeof useTheme>['colors']): string {
  if (rate > 100) return colors.error;
  if (rate >= 85) return colors.warning;
  if (rate >= 50) return colors.primarySurface;
  return colors.borderLight;
}

function CapacityHeatmapRow({ item, onPress }: { item: CapacitySummary; onPress: () => void }) {
  const { colors } = useTheme();
  const accessibilitySummary = item.capacity
    .map(
      (day) =>
        `${formatShortDate(day.date)} ${formatNumber(Number(day.utilizationRate ?? 0) * 100)}%`,
    )
    .join('，');
  return (
    <Pressable
      style={({ pressed }) => [styles.heatmapRow, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}未来七天计划负荷，${accessibilitySummary}`}
    >
      <View style={styles.heatmapRowHeader}>
        <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text
          style={[
            styles.rowValue,
            { color: item.peakRate > 100 ? colors.error : colors.textSecondary },
          ]}
        >
          峰值 {formatNumber(item.peakRate)}%
        </Text>
      </View>
      <View style={styles.heatmapCells}>
        {item.capacity.map((day) => {
          const rate = Number(day.utilizationRate ?? 0) * 100;
          return (
            <View
              key={day.date}
              style={[
                styles.heatmapCell,
                {
                  backgroundColor: capacityCellColor(rate, colors),
                  borderColor: colors.borderLight,
                },
              ]}
              accessible
              accessibilityLabel={`${formatShortDate(day.date)} 计划负荷 ${formatNumber(rate)}%`}
            >
              <Text
                style={[
                  styles.heatmapCellValue,
                  { color: rate > 100 ? colors.surface : colors.text },
                ]}
              >
                {Math.round(rate)}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.metaText, { color: colors.textSecondary }]}>
        均值 {formatNumber(item.averageRate)}% ·{' '}
        {item.overloadDays > 0 ? `${item.overloadDays} 天超负荷` : '无超负荷'}
        {item.unavailableEquipment > 0 ? ` · ${item.unavailableEquipment} 台设备不可用` : ''}
      </Text>
    </Pressable>
  );
}

function CapacityOverview({
  cockpit,
  onOpenWorkCenter,
}: Pick<DashboardProductionSectionsProps, 'cockpit' | 'onOpenWorkCenter'>) {
  const { colors } = useTheme();
  const capacity = useMemo(
    () =>
      cockpit.workCenters.capacity
        .map(summarizeCapacity)
        .sort(
          (left, right) => right.overloadDays - left.overloadDays || right.peakRate - left.peakRate,
        )
        .slice(0, 5),
    [cockpit.workCenters.capacity],
  );
  const dateLabels = capacity[0]?.capacity ?? [];

  return (
    <>
      <ReportSectionHeader
        title="未来 7 天排产负荷"
        hint={`${cockpit.workCenters.capacityDateFrom} 至 ${cockpit.workCenters.capacityDateTo} · 超负荷优先展示前 5 个工作中心`}
      />
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {capacity.length > 0 ? (
          <>
            <View style={styles.heatmapDateRow}>
              <Text style={[styles.heatmapAxisLabel, { color: colors.textSecondary }]}>负荷 %</Text>
              {dateLabels.map((day) => (
                <Text key={day.date} style={[styles.heatmapDate, { color: colors.textSecondary }]}>
                  {parseDate(day.date)?.format('D') ?? '-'}
                </Text>
              ))}
            </View>
            {capacity.map((item) => (
              <CapacityHeatmapRow
                key={item.id}
                item={item}
                onPress={() => onOpenWorkCenter(item.id, item.name)}
              />
            ))}
            <View style={styles.heatmapLegend}>
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>低于 50%</Text>
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>50–85%</Text>
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>85–100%</Text>
              <Text style={[styles.legendText, { color: colors.error }]}>超负荷</Text>
            </View>
          </>
        ) : (
          <EmptyState compact icon="calendar-outline" title="未来 7 天暂无排产负荷" />
        )}
      </View>
    </>
  );
}

function PriorityOrderCard({
  orders,
  onOpenOrder,
}: {
  orders: OrderProgressItemDto[];
  onOpenOrder: (order: OrderProgressItemDto) => void;
}) {
  const { colors } = useTheme();
  if (orders.length === 0) return null;

  return (
    <>
      <ReportSectionHeader title="重点工单进度" hint="计划超时或进度低于 70%" />
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {orders.map((order) => {
          const progress = clampPercent(order.progress);
          return (
            <Pressable
              key={order.id}
              style={({ pressed }) => [styles.priorityRow, pressed && styles.pressed]}
              onPress={() => onOpenOrder(order)}
              accessibilityRole="button"
              accessibilityLabel={`查看工单${order.orderNo}`}
            >
              <View style={styles.statusHeader}>
                <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
                  {order.orderNo}
                </Text>
                <Text
                  style={[
                    styles.rowValue,
                    { color: order.planEndOverdue ? colors.error : colors.warning },
                  ]}
                >
                  {order.planEndOverdue ? '计划超时' : `${formatNumber(progress)}%`}
                </Text>
              </View>
              <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                {order.materialName ?? '未指定物料'} · 计划 {formatCompactNumber(order.plannedQty)}
                {order.planEndTime ? ` · ${formatDateTime(order.planEndTime)}` : ''}
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                      backgroundColor: order.planEndOverdue ? colors.error : colors.warning,
                    },
                  ]}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

export function DashboardProductionSections({
  cockpit,
  onOpenStatus,
  onOpenWorkCenter,
  onOpenOrder,
}: DashboardProductionSectionsProps) {
  return (
    <>
      <PriorityOrderCard orders={cockpit.priorityOrders} onOpenOrder={onOpenOrder} />
      <WorkOrderStatusCard cockpit={cockpit} onOpenStatus={onOpenStatus} />
      <CapacityOverview cockpit={cockpit} onOpenWorkCenter={onOpenWorkCenter} />
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs, ...Shadow.sm },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  rowTitle: { flex: 1, fontSize: FontSize.sm, fontWeight: '600' },
  rowValue: { fontSize: FontSize.xs, fontWeight: '700' },
  progressTrack: { height: Spacing.xs, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: Spacing.xs, borderRadius: Radius.full },
  metaText: { fontSize: FontSize.xs },
  heatmapRow: { paddingVertical: Spacing.xs, gap: Spacing.xs },
  heatmapRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  heatmapDateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  heatmapAxisLabel: { width: 82, fontSize: FontSize.xs },
  heatmapDate: { flex: 1, textAlign: 'center', fontSize: FontSize.xs },
  heatmapCells: { flexDirection: 'row', marginLeft: 82, gap: Spacing.xs },
  heatmapCell: {
    flex: 1,
    minWidth: 20,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
  },
  heatmapCellValue: { fontSize: FontSize.xs - 2, fontWeight: '600' },
  heatmapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  legendText: { fontSize: FontSize.xs },
  priorityRow: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  pressed: { opacity: 0.72 },
});
