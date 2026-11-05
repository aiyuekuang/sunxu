import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { QualityReportQueryDto } from '../../../types/models/QualityReportQueryDto';
import type { TopDefectItemDto } from '../../../types/models/TopDefectItemDto';
import { type QualitySummary, reportService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { LoadingView } from '../../../../core/components/LoadingView.tsx';
import {
  INSPECTION_STATUS_CONFIG,
  INSPECTION_TYPE_CONFIG,
  QUALITY_DEFECT_SEVERITY_CONFIG,
} from '../../../constants/status-configs';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import type { QualityStackParamList, RootStackParamList } from '../../../host/navigation';
import { formatCompactNumber, formatNumber } from '../../../../core/utils/format';
import { toast } from '../../../../core/toast';
import type { ReportDateRange, ReportFilterState } from './ReportContextBar.tsx';
import { ReportDonutChart } from './ReportDonutChart.tsx';
import { ReportMetricCard } from './ReportMetricCard.tsx';
import { ReportPeriodHero } from './ReportPeriodHero.tsx';
import { ReportPolicyDisclosure } from './ReportPolicyDisclosure.tsx';

interface QualityTabProps {
  dateRange: ReportDateRange;
  filters: ReportFilterState;
}

function buildQualityQuery(
  dateRange: ReportDateRange,
  filters: ReportFilterState,
): QualityReportQueryDto {
  return {
    dateFrom: dateRange.startDate,
    dateTo: dateRange.endDate,
    materialId: filters.materialId,
    type: filters.qualityType,
    status: filters.qualityStatus,
    severity: filters.severity,
  };
}

const QUALITY_POLICY_ITEMS = [
  '合格率、缺陷排行和待处理质检按当前筛选范围统计。',
  '综合合格率仅按有效检验样本计算；无有效样本时显示“—”。',
  '缺陷排行按缺陷数量排序。',
];

interface DefectRowProps {
  item: TopDefectItemDto;
  rank: number;
  total: number;
}

const DefectRow = function DefectRow({ item, rank, total }: DefectRowProps) {
  const { colors } = useTheme();
  const percentage = total > 0 ? Math.round((Number(item.qty) / total) * 100) : 0;
  const severityConfig = QUALITY_DEFECT_SEVERITY_CONFIG[item.severity];
  return (
    <View style={[styles.defectRow, { borderBottomColor: colors.borderLight }]}>
      <Text style={[styles.rank, { color: colors.textSecondary }]}>{rank}</Text>
      <View style={styles.defectBody}>
        <View style={styles.defectHeader}>
          <Text style={[styles.defectName, { color: colors.text }]} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={[styles.defectQty, { color: colors.text }]}>
            {formatCompactNumber(item.qty)}
          </Text>
        </View>
        <View style={[styles.defectTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.defectFill,
              {
                width: `${percentage}%`,
                backgroundColor: severityConfig?.color ?? colors.warning,
              },
            ]}
          />
        </View>
        <Text style={[styles.defectMeta, { color: colors.textSecondary }]}>
          {severityConfig?.label ?? item.severity} · {percentage}%
        </Text>
      </View>
    </View>
  );
};

export function QualityTab({ dateRange, filters }: QualityTabProps) {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList & QualityStackParamList>>();
  const [data, setData] = useState<QualitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const query = useMemo(() => buildQualityQuery(dateRange, filters), [dateRange, filters]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setData(await reportService.getQualitySummary(query));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '加载质量报表失败');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openQualityList = useCallback(
    (initialTab?: string) => {
      navigation.navigate('Quality', {
        screen: 'QualityList',
        params: {
          initialTab,
          materialId: filters.materialId,
          materialName: filters.materialDisplay,
        },
      });
    },
    [filters.materialDisplay, filters.materialId, navigation],
  );

  if (loading) return <LoadingView />;
  if (!data) {
    return (
      <EmptyState
        compact
        icon="alert-circle-outline"
        title="质量报表加载失败"
        action={{ label: '重试', onPress: () => void loadData() }}
      />
    );
  }

  const defectTotal = data.topDefects.reduce((sum, item) => sum + Number(item.qty), 0);
  const hasBusinessData =
    data.totalCount > 0 || data.pendingCount > 0 || data.topDefects.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headingRow}>
        <View style={styles.headingText}>
          <Text style={[styles.title, { color: colors.text }]}>质量分析</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            检验结果与待处理任务
          </Text>
        </View>
        <View style={styles.headingActions}>
          <ReportPolicyDisclosure items={QUALITY_POLICY_ITEMS} />
          <Pressable
            style={({ pressed }) => [
              styles.detailButton,
              { borderColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={() => openQualityList()}
            hitSlop={HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel="查看质检列表"
          >
            <Text style={[styles.detailText, { color: colors.primary }]}>查看质检单</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <ReportPeriodHero
        label="综合合格率"
        value={`${formatNumber(data.passRate)}%`}
        icon="checkmark-circle-outline"
        tone="success"
        onPress={() => openQualityList('passed')}
      />

      <View style={styles.metricsGrid}>
        <ReportMetricCard
          label="检验总批"
          value={data.totalCount}
          tone="primary"
          icon="documents-outline"
          onPress={() => openQualityList()}
        />
        <ReportMetricCard
          label="不合格"
          value={data.failCount}
          tone="error"
          icon="close-circle-outline"
          onPress={() => openQualityList('rejected')}
        />
        <ReportMetricCard
          label="待处理质检"
          value={data.pendingCount}
          tone="warning"
          icon="time-outline"
          onPress={() => openQualityList('pending')}
        />
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>检验结果构成</Text>
            <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
              按有效检验样本统计
            </Text>
          </View>
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
            共 {formatCompactNumber(data.totalSample)} 件
          </Text>
        </View>
        <View style={[styles.defectCard, { backgroundColor: colors.surface }]}>
          <ReportDonutChart
            items={[
              { id: 'passed', label: '合格', value: data.totalPass, color: colors.success },
              { id: 'rejected', label: '不合格', value: data.totalFail, color: colors.error },
            ]}
            centerLabel="合格率"
            centerValue={`${formatNumber(data.passRate)}%`}
            accessibilityLabel={`检验合格 ${formatCompactNumber(data.totalPass)}，不合格 ${formatCompactNumber(data.totalFail)}，合格率 ${formatNumber(data.passRate)}%`}
            onPressItem={(status) => openQualityList(status)}
          />
        </View>
      </View>

      {!hasBusinessData ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <EmptyState compact icon="shield-checkmark-outline" title="当前范围暂无质量数据" />
        </View>
      ) : null}

      {data.topDefects.length > 0 ? (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>缺陷排行</Text>
              <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
                按缺陷数量排序
              </Text>
            </View>
            <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
              共 {formatCompactNumber(defectTotal)}
            </Text>
          </View>
          <View style={[styles.defectCard, { backgroundColor: colors.surface }]}>
            {data.topDefects.map((item, index) => (
              <DefectRow
                key={`${item.description}-${item.severity}`}
                item={item}
                rank={index + 1}
                total={defectTotal}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <EmptyState compact icon="checkmark-done-outline" title="当前范围暂无缺陷记录" />
        </View>
      )}

      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>合格数量</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {formatCompactNumber(data.totalPass)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>不合格数量</Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>
            {formatCompactNumber(data.totalFail)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>抽检数量</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatCompactNumber(data.totalSample)}
          </Text>
        </View>
        {filters.qualityType || filters.qualityStatus ? (
          <View style={[styles.filterNote, { borderTopColor: colors.borderLight }]}>
            {filters.qualityType ? (
              <Text style={[styles.filterNoteText, { color: colors.textSecondary }]}>
                {INSPECTION_TYPE_CONFIG[filters.qualityType]?.label}
              </Text>
            ) : null}
            {filters.qualityStatus ? (
              <Text style={[styles.filterNoteText, { color: colors.textSecondary }]}>
                {INSPECTION_STATUS_CONFIG[filters.qualityStatus]?.label}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
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
  headingActions: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  detailButton: {
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  detailText: { fontSize: FontSize.xs, fontWeight: '600' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  sectionBlock: { gap: Spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '700' },
  sectionHint: { fontSize: FontSize.xs },
  defectCard: { borderRadius: Radius.md, paddingHorizontal: Spacing.md, ...Shadow.sm },
  defectRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rank: { width: Spacing.lg, paddingTop: Spacing.xs, fontSize: FontSize.sm, fontWeight: '700' },
  defectBody: { flex: 1, gap: Spacing.xs },
  defectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  defectName: { flex: 1, fontSize: FontSize.sm, fontWeight: '600' },
  defectQty: { fontSize: FontSize.xs, fontWeight: '600' },
  defectTrack: { height: Spacing.xs, borderRadius: Radius.full, overflow: 'hidden' },
  defectFill: { height: Spacing.xs, borderRadius: Radius.full },
  defectMeta: { fontSize: FontSize.xs },
  summaryCard: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm, ...Shadow.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.sm },
  summaryValue: { fontSize: FontSize.md, fontWeight: '700' },
  filterNote: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, gap: Spacing.xs },
  filterNoteText: { fontSize: FontSize.xs },
  emptyCard: { minHeight: Spacing['4xl'] * 2, borderRadius: Radius.md, justifyContent: 'center' },
  pressed: { opacity: 0.72 },
});
