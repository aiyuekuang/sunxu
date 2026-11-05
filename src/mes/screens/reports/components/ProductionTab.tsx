import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { ProductionAnalysisResponseDto } from '../../../types/models/ProductionAnalysisResponseDto';
import { ReportDashboardSnapshotQueryDto } from '../../../types/models/ReportDashboardSnapshotQueryDto';
import { reportService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { LoadingView } from '../../../../core/components/LoadingView.tsx';
import type { ReportPeriodState } from '../../../constants/report-quick-range';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import type { RootStackParamList } from '../../../host/navigation';
import { today } from '../../../../core/utils/date';
import { formatCompactNumber, formatNumber } from '../../../../core/utils/format';
import { toast } from '../../../../core/toast';
import { ProductionHealthRadarCard } from './ProductionHealthRadarCard.tsx';
import { ProductionTrendCard } from './ProductionTrendCard.tsx';
import { ProductionWorkCenterCard } from './ProductionWorkCenterCard.tsx';
import type { ReportDateRange, ReportFilterState } from './ReportContextBar.tsx';
import { ReportMetricCard } from './ReportMetricCard.tsx';
import { ReportPeriodHero } from './ReportPeriodHero.tsx';
import { ReportPolicyDisclosure } from './ReportPolicyDisclosure.tsx';
import { ReportSectionHeader } from './ReportSectionHeader.tsx';

interface ProductionTabProps {
  dateRange: ReportDateRange;
  filters: ReportFilterState;
  period: ReportPeriodState;
}

type MetricTone = 'primary' | 'success' | 'warning' | 'error';

function buildAnalysisQuery(
  dateRange: ReportDateRange,
  filters: ReportFilterState,
  period: ReportPeriodState,
): ReportDashboardSnapshotQueryDto {
  return {
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
  };
}

function getProductionPolicyItems(isToday: boolean): string[] {
  const items = [
    '按期交付率按工单客户交期统计；交期日仍为今天的工单暂不计入分母，实际完工日期不晚于交期日即为按期。',
    '完工产量与完工工单按实际完工时间归属所选期间。',
    '计划达成率按所选期间新建工单（不含草稿和已取消）的完成数量 ÷ 计划数量计算。',
    '工作中心瓶颈按计划排产窗口命中所选期间，完工与逾期为当前时点状态。',
    '报工不良率按有效报工不良数量 ÷（良品数量 + 不良数量）计算。',
  ];
  if (isToday) items.push('单日的工作中心瓶颈按最近 7 天排产窗口统计。');
  return items;
}

/** 比率类指标：值越高越好，good 以上为达标、warn 以上为预警。 */
function ratioTone(value: number | null, good: number, warn: number): MetricTone {
  if (value == null) return 'primary';
  if (value >= good) return 'success';
  if (value >= warn) return 'warning';
  return 'error';
}

/** 不良率类指标：值越低越好。 */
function defectTone(value: number | null): MetricTone {
  if (value == null) return 'primary';
  if (value <= 2) return 'success';
  if (value <= 5) return 'warning';
  return 'error';
}

function formatRate(value: number | null): string {
  return value == null ? '—' : `${formatNumber(value)}%`;
}

export function ProductionTab({ dateRange, filters, period }: ProductionTabProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [analysis, setAnalysis] = useState<ProductionAnalysisResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const isToday = dateRange.startDate === today() && dateRange.endDate === today();

  const query = useMemo(
    () => buildAnalysisQuery(dateRange, filters, period),
    [dateRange, filters, period],
  );

  const goWorkOrders = useCallback(
    (status?: string, overdueOnly?: boolean, workCenterId?: string, workCenterName?: string) => {
      navigation.navigate('WorkOrders', {
        screen: 'WorkOrdersList',
        params: {
          initialTab: status ?? 'all',
          overdueOnly,
          workCenterId,
          workCenterName,
        },
      });
    },
    [navigation],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setAnalysis(await reportService.getProductionAnalysis(query));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '加载生产分析失败');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) return <LoadingView />;
  if (!analysis) {
    return (
      <EmptyState
        compact
        icon="alert-circle-outline"
        title="生产分析加载失败"
        action={{ label: '重试', onPress: () => void loadData() }}
      />
    );
  }

  const { delivery, output, workCenters, trend, completedWorkOrderTrend } = analysis;
  const deliveryRate = delivery.onTimeDeliveryRate ?? null;
  const achievementRate = output.achievementRate ?? null;
  const reportDefectRate = output.reportDefectRate ?? null;
  const overdueNotDelivered = Number(delivery.overdueNotDeliveredWorkOrders ?? 0);
  const reportedTotalQty =
    Number(output.reportedGoodQty ?? 0) + Number(output.reportedDefectQty ?? 0);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headingRow}>
        <View style={styles.headingText}>
          <Text style={[styles.title, { color: colors.text }]}>生产分析</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {dateRange.startDate} 至 {dateRange.endDate}
          </Text>
        </View>
        <ReportPolicyDisclosure items={getProductionPolicyItems(isToday)} />
      </View>

      <ReportSectionHeader
        title="交付履约"
        hint={`应交付判定 ${delivery.dueWindowFrom} 至 ${delivery.dueWindowTo}`}
      />
      <ReportPeriodHero
        label="按期交付率"
        value={formatRate(deliveryRate)}
        hint={`${formatCompactNumber(delivery.onTimeCompletedWorkOrders)} / ${formatCompactNumber(
          delivery.deliveryEligibleWorkOrders,
        )} 单按期`}
        icon="time-outline"
        tone={ratioTone(deliveryRate, 95, 85)}
        onPress={() => goWorkOrders(undefined, true)}
      />
      <View style={styles.metricsGrid}>
        <ReportMetricCard
          label="应交付工单"
          value={delivery.deliveryEligibleWorkOrders}
          tone="primary"
          icon="file-tray-full-outline"
          hint="期间已到期"
        />
        <ReportMetricCard
          label="按期完工"
          value={delivery.onTimeCompletedWorkOrders}
          tone="success"
          icon="checkmark-circle-outline"
          onPress={() => goWorkOrders('completed')}
        />
        <ReportMetricCard
          label="逾期未交付"
          value={overdueNotDelivered}
          tone={overdueNotDelivered > 0 ? 'error' : 'success'}
          icon="alert-circle-outline"
          onPress={() => goWorkOrders(undefined, true)}
        />
      </View>

      <ReportSectionHeader title="产出与达成" hint="完工口径按实际完工时间" />
      <View style={styles.metricsGrid}>
        <ReportMetricCard
          label="完工产量"
          value={output.outputQty ?? '-'}
          tone="primary"
          icon="trending-up-outline"
          onPress={() => goWorkOrders()}
        />
        <ReportMetricCard
          label="完工工单"
          value={output.completedWorkOrders}
          tone="success"
          icon="checkmark-circle-outline"
          onPress={() => goWorkOrders('completed')}
        />
        <ReportMetricCard
          label="计划达成率"
          value={formatRate(achievementRate)}
          tone={ratioTone(achievementRate, 95, 85)}
          icon="speedometer-outline"
          hint={`${formatCompactNumber(output.completedQty)} / ${formatCompactNumber(
            output.plannedQty,
          )} 件完成`}
        />
        <ReportMetricCard
          label="报工不良率"
          value={formatRate(reportDefectRate)}
          tone={defectTone(reportDefectRate)}
          icon="alert-circle-outline"
          hint={`${formatCompactNumber(output.reportedDefectQty)} / ${formatCompactNumber(
            reportedTotalQty,
          )} 件不良`}
        />
      </View>

      <ProductionHealthRadarCard delivery={delivery} output={output} />

      <ProductionWorkCenterCard
        dateFrom={workCenters.dateFrom}
        dateTo={workCenters.dateTo}
        items={workCenters.items}
        onOpenWorkCenter={(workCenterId, workCenterName) =>
          goWorkOrders(undefined, undefined, workCenterId, workCenterName)
        }
      />

      <ProductionTrendCard
        outputTrend={trend}
        completedTrend={completedWorkOrderTrend}
        period={period}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.md, gap: Spacing.md },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  headingText: { flex: 1, gap: Spacing.xs },
  title: { fontSize: FontSize.lg, fontWeight: '700' },
  subtitle: { fontSize: FontSize.xs },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
