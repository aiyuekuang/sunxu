import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { AlertEventItemDto } from '../../../types/models/AlertEventItemDto';
import type { DashboardCockpitResponseDto } from '../../../types/models/DashboardCockpitResponseDto';
import type { DashboardComparisonDto } from '../../../types/models/DashboardComparisonDto';
import type { ProductionTrendItemDto } from '../../../host/contracts/generated/models/ProductionTrendItemDto.d.ts';
import { DashboardWorkOrderStatusDto } from '../../../types/models/DashboardWorkOrderStatusDto';
import type { NameQtyItemDto } from '../../../types/models/NameQtyItemDto';
import { ReportDashboardSnapshotQueryDto } from '../../../types/models/ReportDashboardSnapshotQueryDto';
import type { ReportSnapshotMetaDto } from '../../../types/models/ReportSnapshotMetaDto';
import {
  type DashboardData,
  type DashboardLargeScreen,
  type QualitySummary,
  type RealtimeDashboard,
  reportService,
} from '../../../host/services';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { LoadingView } from '../../../../core/components/LoadingView.tsx';
import type { ReportPeriodState } from '../../../constants/report-quick-range';
import { Spacing } from '../../../../core/theme/tokens';
import type { RootStackParamList } from '../../../host/navigation';
import { socketService, WS_EVENTS } from '../../../host/realtime';
import { today } from '../../../../core/utils/date';
import { formatCompactNumber, formatNumber } from '../../../../core/utils/format';
import { toast } from '../../../../core/toast';
import { DashboardHourlyProductionChart } from './DashboardHourlyProductionChart.tsx';
import {
  DashboardAlertEventCard,
  DashboardAttentionCard,
  DashboardDefectDistributionCard,
  DashboardLiveProductionCard,
  DashboardQualityMixCard,
} from './DashboardOperationalCards.tsx';
import { DashboardProductionSections } from './DashboardProductionSections.tsx';
import type { ReportDateRange, ReportFilterState } from './ReportContextBar.tsx';
import { ReportDashboardHeader } from './ReportDashboardHeader.tsx';
import ReportFavoritesCard from './ReportFavoritesCard.tsx';
import { ReportMetricCard } from './ReportMetricCard.tsx';
import { ReportPeriodHero } from './ReportPeriodHero.tsx';
import { ReportSectionHeader } from './ReportSectionHeader.tsx';

interface DashboardTabProps {
  dateRange: ReportDateRange;
  period: ReportPeriodState;
  filters: ReportFilterState;
}

interface DashboardSnapshot {
  meta: ReportSnapshotMetaDto;
  dashboard: DashboardData;
  realtime: RealtimeDashboard | null;
  quality: QualitySummary;
  trend: ProductionTrendItemDto[];
  largeScreen: DashboardLargeScreen | null;
  alertEvents: AlertEventItemDto[];
  stockWarningCount: number;
  comparison?: DashboardComparisonDto;
  cockpit: DashboardCockpitResponseDto;
}

const EMPTY_DASHBOARD_COCKPIT: DashboardCockpitResponseDto = {
  completedWorkOrderTrend: [],
  periodPerformance: {
    completedWorkOrders: 0,
    deliveryEligibleWorkOrders: 0,
    onTimeCompletedWorkOrders: 0,
    onTimeDeliveryRate: null,
    outputQty: 0,
    reportDefectRate: null,
    reportedDefectQty: 0,
    reportedGoodQty: 0,
    unitBreakdown: [],
  },
  priorityOrders: [],
  workCenters: {
    capacity: [],
    capacityDateFrom: '',
    capacityDateTo: '',
    execution: [],
    executionDateFrom: '',
    executionDateTo: '',
  },
  workOrderStatus: {
    scope: DashboardWorkOrderStatusDto.scope.CURRENT_FLOW,
    summary: { byStatus: {}, overdueCount: 0, total: 0 },
  },
};

function normalizeDashboardCockpit(value: unknown): DashboardCockpitResponseDto {
  return value && typeof value === 'object'
    ? (value as DashboardCockpitResponseDto)
    : EMPTY_DASHBOARD_COCKPIT;
}

function useNavigateToWorkOrders() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return useCallback(
    (
      initialTab?: string,
      initialExecutionState?: 'ready_to_start' | 'pending_confirm' | 'unscheduled',
      overdueOnly?: boolean,
    ) => {
      navigation.navigate('WorkOrders', {
        screen: 'WorkOrdersList',
        params: { initialTab: initialTab ?? 'all', initialExecutionState, overdueOnly },
      });
    },
    [navigation],
  );
}

function getDashboardPolicyItems(isToday: boolean): string[] {
  const items = [
    isToday ? '今日完工产量按当前已确认报工统计。' : '期间完工产量按所选日期范围汇总。',
    '完工工单按实际完工时间归属所选期间。',
    '按期交付率按工单客户交期统计；交期日仍为今天的工单暂不计入分母，实际完工日期不晚于交期日即为按期。',
    '报工不良率按有效报工不良数量 ÷（良品数量 + 不良数量）计算。',
    '综合合格率仅按有效检验样本计算；无有效样本时显示“—”。',
    '当前在制、当前交期逾期、库存预警和未来排产负荷为当前快照。',
  ];
  if (isToday) items.push('待开工、交期逾期和现场执行数据按当前时点刷新。');
  return items;
}

export function DashboardTab({ dateRange, period, filters }: DashboardTabProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const goWorkOrders = useNavigateToWorkOrders();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isToday = dateRange.startDate === today() && dateRange.endDate === today();
  const snapshotQuery = useMemo(
    () => ({
      dateFrom: dateRange.startDate,
      dateTo: dateRange.endDate,
      materialId: filters.materialId,
      workCenterId: filters.workCenterId,
      status: filters.productionStatus,
      overdueOnly: filters.overdueOnly,
      period:
        dateRange.label === '自定义'
          ? ReportDashboardSnapshotQueryDto.period.CUSTOM
          : period.key === 'today'
            ? ReportDashboardSnapshotQueryDto.period.DAY
            : period.key === 'week'
              ? ReportDashboardSnapshotQueryDto.period.WEEK
              : period.key === 'month'
                ? ReportDashboardSnapshotQueryDto.period.MONTH
                : ReportDashboardSnapshotQueryDto.period.YEAR,
    }),
    [
      dateRange.endDate,
      dateRange.label,
      dateRange.startDate,
      filters.materialId,
      filters.overdueOnly,
      filters.productionStatus,
      filters.workCenterId,
      period.key,
    ],
  );

  const loadData = useCallback(
    async (isRefresh = false, silent = false) => {
      if (isRefresh && !silent) setRefreshing(true);
      try {
        const snapshotResponse = await reportService.getDashboardSnapshot(snapshotQuery);
        const { dashboard, realtime: rawRealtime, quality, trend } = snapshotResponse;
        const realtime = rawRealtime
          ? {
              workOrders: {
                running: rawRealtime.workOrders.running,
                pending: rawRealtime.workOrders.pending,
                completed: rawRealtime.workOrders.completed,
                paused: rawRealtime.workOrders.paused,
              },
              todayQty: rawRealtime.workOrders.todayOutput ?? 0,
              overdueCount: rawRealtime.workOrders.overdue,
              qualityPassRate: rawRealtime.quality.passRate,
              equipmentStatus: {
                available:
                  rawRealtime.equipment.find((item) => item.status === 'active')?.count ?? 0,
                busy: rawRealtime.equipment.find((item) => item.status === 'occupied')?.count ?? 0,
                maintenance:
                  rawRealtime.equipment.find((item) => item.status === 'maintenance')?.count ?? 0,
                fault: rawRealtime.equipment.find((item) => item.status === 'repair')?.count ?? 0,
                retired:
                  rawRealtime.equipment.find((item) => item.status === 'retired')?.count ?? 0,
              },
            }
          : null;
        setSnapshot({
          meta: snapshotResponse.meta,
          dashboard,
          realtime,
          quality,
          trend,
          largeScreen: snapshotResponse.largeScreen ?? null,
          alertEvents: snapshotResponse.alertEvents?.events ?? [],
          stockWarningCount: snapshotResponse.stockWarningCount,
          comparison: snapshotResponse.comparison,
          cockpit: normalizeDashboardCockpit(snapshotResponse.cockpit),
        });
      } catch (error: unknown) {
        if (!silent) {
          toast.error(error instanceof Error ? error.message : '加载看板失败');
          setSnapshot(null);
        }
      } finally {
        setLoading(false);
        if (!silent) setRefreshing(false);
      }
    },
    [snapshotQuery],
  );

  useEffect(() => {
    setLoading(true);
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isToday) return;
    const refreshSilently = () => {
      void loadData(true, true);
    };
    const unsubscribeWorkOrder = socketService.on(WS_EVENTS.WORK_ORDER_UPDATED, refreshSilently);
    const unsubscribeStats = socketService.on(WS_EVENTS.STATS_UPDATED, refreshSilently);
    const interval = setInterval(refreshSilently, 30_000);
    return () => {
      unsubscribeWorkOrder();
      unsubscribeStats();
      clearInterval(interval);
    };
  }, [isToday, loadData]);

  if (loading) return <LoadingView />;
  if (!snapshot) {
    return (
      <EmptyState
        compact
        icon="alert-circle-outline"
        title="看板加载失败"
        action={{ label: '重试', onPress: () => void loadData() }}
      />
    );
  }

  const { dashboard, realtime, quality, trend, largeScreen, alertEvents, comparison, cockpit } =
    snapshot;
  const overdue = Number(dashboard.workOrders.overdueCount ?? 0);
  const performance = cockpit.periodPerformance;
  const output = Number(performance.outputQty ?? 0);
  const passRate = Number(quality.passRate ?? 0);
  const totalQualityQty = Number(quality.totalPass ?? 0) + Number(quality.totalFail ?? 0);
  const hasQualityData = totalQualityQty > 0;
  const completedWorkOrders = Number(performance.completedWorkOrders ?? 0);
  const inProgressWorkOrders = Number(dashboard.workOrders.inProgress ?? 0);
  const deliveryRate = performance.onTimeDeliveryRate;
  const reportDefectRate = performance.reportDefectRate;
  const riskCount = overdue + quality.pendingCount + snapshot.stockWarningCount;
  const defectItems: NameQtyItemDto[] =
    quality.topDefects.length > 0
      ? quality.topDefects.map((item) => ({ name: item.description, qty: item.qty }))
      : (largeScreen?.defectDistribution ?? []);
  const handleOpenStatus = (status: string) => {
    if (status === 'unscheduled' || status === 'pending_confirm' || status === 'ready_to_start') {
      goWorkOrders(undefined, status);
      return;
    }
    goWorkOrders(status);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void loadData(true)} />
      }
      contentContainerStyle={styles.content}
    >
      <ReportDashboardHeader
        policyItems={getDashboardPolicyItems(isToday)}
        warnings={snapshot.meta.warnings}
      />

      <ReportPeriodHero
        label={isToday ? '今日完工产量' : '期间完工产量'}
        value={output}
        icon="trending-up-outline"
        tone="success"
        comparison={comparison?.outputQty}
        onPress={() => goWorkOrders()}
      />

      <View style={styles.metricsGrid}>
        <ReportMetricCard
          variant="compact"
          label="当前在制工单"
          value={inProgressWorkOrders}
          tone="primary"
          icon="construct-outline"
          onPress={() => goWorkOrders('in_progress')}
          hint={`计划达成 ${formatNumber(dashboard.production.completionRate)}%`}
        />
        <ReportMetricCard
          variant="compact"
          label={isToday ? '今日完工工单' : '期间完工工单'}
          value={completedWorkOrders}
          tone="success"
          icon="checkmark-circle-outline"
          onPress={() => goWorkOrders('completed')}
          comparison={comparison?.completedWorkOrders}
        />
        <ReportMetricCard
          variant="compact"
          label="当前交期逾期工单"
          value={overdue}
          tone={overdue > 0 ? 'error' : 'success'}
          icon="warning-outline"
          onPress={() => goWorkOrders(undefined, undefined, true)}
        />
        <ReportMetricCard
          variant="compact"
          label="按期交付率"
          value={deliveryRate == null ? '-' : `${formatNumber(deliveryRate)}%`}
          tone={
            deliveryRate == null || deliveryRate >= 95
              ? 'success'
              : deliveryRate >= 85
                ? 'warning'
                : 'error'
          }
          icon="time-outline"
          hint={`${formatCompactNumber(performance.onTimeCompletedWorkOrders)} / ${formatCompactNumber(performance.deliveryEligibleWorkOrders)} 单按期`}
        />
        <ReportMetricCard
          variant="compact"
          label="报工不良率"
          value={reportDefectRate == null ? '-' : `${formatNumber(reportDefectRate)}%`}
          tone={
            reportDefectRate == null || reportDefectRate <= 2
              ? 'success'
              : reportDefectRate <= 5
                ? 'warning'
                : 'error'
          }
          icon="alert-circle-outline"
          hint={`${formatCompactNumber(performance.reportedDefectQty)} / ${formatCompactNumber(
            (performance.reportedGoodQty ?? 0) + (performance.reportedDefectQty ?? 0),
          )} 件不良`}
        />
        <ReportMetricCard
          variant="compact"
          label="综合合格率"
          value={hasQualityData ? `${formatNumber(passRate)}%` : '-'}
          tone={passRate >= 98 ? 'success' : passRate >= 95 ? 'warning' : 'error'}
          icon="shield-checkmark-outline"
          onPress={() => navigation.navigate('Quality', { screen: 'QualityList' })}
          comparison={comparison?.qualityPassRate}
          hint={hasQualityData ? `${formatCompactNumber(totalQualityQty)} 件检验` : undefined}
        />
      </View>

      {isToday ? <DashboardHourlyProductionChart trend={trend} /> : null}

      <ReportSectionHeader title="需要关注" hint={`${riskCount} 项待处理`} />
      <DashboardAttentionCard
        overdue={overdue}
        pendingInspections={quality.pendingCount}
        lowStock={snapshot.stockWarningCount}
        onOverdue={() => goWorkOrders(undefined, undefined, true)}
        onQuality={() =>
          navigation.navigate('Quality', {
            screen: 'QualityList',
            params: { initialTab: 'pending' },
          })
        }
        onStock={() =>
          navigation.navigate('Warehouse', {
            screen: 'WarehousesList',
            params: { lowStock: true },
          })
        }
      />

      {alertEvents.length > 0 ? <DashboardAlertEventCard events={alertEvents} /> : null}

      <DashboardProductionSections
        cockpit={cockpit}
        onOpenStatus={handleOpenStatus}
        onOpenWorkCenter={(workCenterId, workCenterName) =>
          navigation.navigate('WorkOrders', {
            screen: 'WorkOrdersList',
            params: { initialTab: 'all', workCenterId, workCenterName },
          })
        }
        onOpenOrder={(order) =>
          navigation.navigate('WorkOrders', {
            screen: 'WorkOrderDetail',
            params: { id: order.id },
          })
        }
      />

      {isToday && largeScreen && realtime ? (
        <>
          <ReportSectionHeader title="实时生产现场" hint="人员、岗位与工单按最新数据更新" />
          <DashboardLiveProductionCard largeScreen={largeScreen} realtime={realtime} />
        </>
      ) : null}

      <ReportSectionHeader title="质量构成" hint="合格与不合格数量" />
      <DashboardQualityMixCard
        totalPass={quality.totalPass}
        totalFail={quality.totalFail}
        passRate={passRate}
        onPress={() => navigation.navigate('Quality', { screen: 'QualityList' })}
      />

      <ReportSectionHeader title="主要缺陷" hint="按数量排序，优先处理前几项" />
      <DashboardDefectDistributionCard
        items={defectItems}
        onPress={() => navigation.navigate('Quality', { screen: 'QualityList' })}
      />

      <ReportFavoritesCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.md, gap: Spacing.md },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
