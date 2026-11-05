import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { scheduleService } from '../../../host/services';
import { isRequestCanceled } from '../../../host/api-client';
import type { CapacityWorkCenterDto } from '../../../types/generated';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { DateRangeQuickSelect } from '../../../../core/components/DateRangeQuickSelect.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { ProgressBar } from '../../../../core/components/ProgressBar.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatShortDate, weekEnd, weekStart } from '../../../../core/utils/date';
import { toast } from '../../../../core/toast';
import type { ScheduleAnalysisQuery } from '../types';

export interface CapacityPanelProps {
  refreshKey: number;
  query?: ScheduleAnalysisQuery;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDefaultDateRange(): { start: string; end: string } {
  return { start: weekStart(), end: weekEnd() };
}

function getUtilColor(rate: number): string {
  if (rate > 1) return '#DC2626';
  if (rate > 0.85) return '#F59E0B';
  if (rate > 0.6) return '#10B981';
  return '#6B7280';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CapacityPanel({ refreshKey, query }: CapacityPanelProps) {
  const { colors } = useTheme();
  const defaults = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [data, setData] = useState<CapacityWorkCenterDto[]>([]);
  const [loading, setLoading] = useState(false);
  const isControlledByGantt = Boolean(query);
  const capacityLoadGenerationRef = useRef(0);
  const capacityLoadRef = useRef<{
    key: string;
    generation: number;
    promise: Promise<void>;
  } | null>(null);

  useEffect(() => {
    if (!query) return;
    setStartDate(query.startDate);
    setEndDate(query.endDate);
  }, [query]);

  const fetchCapacity = useCallback((): Promise<void> => {
    const requestStartDate = query?.startDate ?? startDate;
    const requestEndDate = query?.endDate ?? endDate;
    if (!requestStartDate || !requestEndDate) return Promise.resolve();

    const params = {
      startDate: requestStartDate,
      endDate: requestEndDate,
      workCenterId: query?.workCenterId,
      workCenterType: query?.workCenterType,
      statuses: query?.statusFilter,
    };
    const key = JSON.stringify(params);
    const existing = capacityLoadRef.current;
    if (existing?.key === key) {
      return existing.promise;
    }

    const generation = ++capacityLoadGenerationRef.current;
    setLoading(true);
    const promise = scheduleService
      .getCapacity(params)
      .then((res) => {
        if (generation !== capacityLoadGenerationRef.current) return;
        setData(res.workCenters ?? []);
      })
      .catch((e: unknown) => {
        if (generation !== capacityLoadGenerationRef.current || isRequestCanceled(e)) return;
        toast.error((e as Error)?.message ?? '获取产能数据失败');
      })
      .finally(() => {
        if (generation === capacityLoadGenerationRef.current) {
          setLoading(false);
        }
        if (capacityLoadRef.current?.generation === generation) {
          capacityLoadRef.current = null;
        }
      });

    capacityLoadRef.current = { key, generation, promise };
    return promise;
  }, [endDate, query, startDate]);

  useFocusEffect(
    useCallback(() => {
      fetchCapacity();
    }, [fetchCapacity]),
  );

  useEffect(() => {
    if (refreshKey > 0) {
      fetchCapacity();
    }
  }, [fetchCapacity, refreshKey]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={fetchCapacity} tintColor={colors.primary} />
      }
    >
      {/* 日期范围 */}
      <View style={styles.dateRow}>
        <DatePickerField
          label=""
          value={startDate}
          onChange={setStartDate}
          mode="date"
          showCurrentShortcut={false}
          placeholder="开始"
          containerStyle={styles.dateField}
          disabled={isControlledByGantt}
          disabledReason={
            isControlledByGantt ? '日期由甘特图当前视图控制，请返回甘特图调整' : undefined
          }
        />
        <Text style={{ color: colors.textMuted, fontSize: FontSize.sm }}>—</Text>
        <DatePickerField
          label=""
          value={endDate}
          onChange={setEndDate}
          mode="date"
          showCurrentShortcut={false}
          placeholder="结束"
          containerStyle={styles.dateField}
          disabled={isControlledByGantt}
          disabledReason={
            isControlledByGantt ? '日期由甘特图当前视图控制，请返回甘特图调整' : undefined
          }
        />
      </View>
      <DateRangeQuickSelect
        disabled={isControlledByGantt}
        onSelect={([start, end]) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />

      {loading && <InlineLoading />}

      {!loading && data.length === 0 && (
        <EmptyState
          compact
          icon="bar-chart-outline"
          title="暂无产能数据"
          description="选择日期范围查看产能"
        />
      )}

      {data.map((wc) => {
        const caps = wc.capacity ?? [];
        const workingCaps = caps.filter((cap) => cap.totalMinutes > 0);
        const avgRate =
          workingCaps.length > 0
            ? workingCaps.reduce(
                (sum, c) => sum + (c.occupiedUtilizationRate ?? c.utilizationRate),
                0,
              ) / workingCaps.length
            : 0;
        const avgPlannedRate =
          workingCaps.length > 0
            ? workingCaps.reduce((sum, c) => sum + c.utilizationRate, 0) / workingCaps.length
            : 0;
        const noCapacityDays = caps.filter(
          (cap) =>
            cap.totalMinutes === 0 &&
            (cap.scheduledMinutes > 0 || (cap.occupiedMinutes ?? cap.scheduledMinutes) > 0),
        ).length;
        const resource = caps[0];
        const capacityConstrainedByEquipment =
          resource != null && resource.effectiveConcurrency < resource.configuredConcurrency;
        const resourceRiskColor = capacityConstrainedByEquipment
          ? colors.error
          : resource?.unavailableEquipmentCount
            ? colors.warning
            : colors.textSecondary;
        return (
          <View key={wc.id} style={[styles.wcCard, { backgroundColor: colors.surface }]}>
            <View style={styles.wcHeader}>
              <Text style={[styles.wcName, { color: colors.text }]}>
                {wc.name} · 工作中心总负荷
              </Text>
              <Text style={[styles.avgRate, { color: getUtilColor(avgRate) }]}>
                实际平均 {Math.round(avgRate * 100)}%
              </Text>
            </View>
            <Text style={[styles.planRate, { color: colors.textSecondary }]}>
              计划平均 {Math.round(avgPlannedRate * 100)}%
            </Text>
            {noCapacityDays > 0 && (
              <Text style={[styles.riskText, { color: colors.error }]}>
                无有效产能但存在排产占用：{noCapacityDays} 天
              </Text>
            )}
            {resource && (
              <View style={styles.resourceSummary}>
                <Text style={[styles.resourceText, { color: resourceRiskColor }]}>
                  {resource.totalEquipmentCount > 0
                    ? `当前设备可用快照 ${resource.availableEquipmentCount}/${resource.totalEquipmentCount}${resource.unavailableEquipmentCount > 0 ? `（${resource.unavailableEquipmentCount} 台不可用）` : ''}`
                    : '未关联设备，按工作中心并发计算'}
                </Text>
                <Text style={[styles.resourceText, { color: resourceRiskColor }]}>
                  有效并发 {resource.effectiveConcurrency}/{resource.configuredConcurrency}
                </Text>
              </View>
            )}
            <View style={styles.daysGrid}>
              {caps.map((day) => {
                const noCapacityWithLoad =
                  day.totalMinutes === 0 &&
                  (day.scheduledMinutes > 0 || (day.occupiedMinutes ?? day.scheduledMinutes) > 0);
                const occupiedMinutes = day.occupiedMinutes ?? day.scheduledMinutes;
                const occupiedUtilizationRate = day.occupiedUtilizationRate ?? day.utilizationRate;
                const rateColor = noCapacityWithLoad
                  ? colors.error
                  : getUtilColor(occupiedUtilizationRate);
                return (
                  <View key={day.date} style={styles.dayItem}>
                    <Text style={[styles.dayDate, { color: colors.textSecondary }]}>
                      {formatShortDate(day.date)}
                    </Text>
                    <ProgressBar
                      current={occupiedMinutes}
                      target={day.totalMinutes || 1}
                      completedColor={rateColor}
                      height={6}
                    />
                    <View style={styles.dayRateBox}>
                      <Text style={[styles.dayRate, { color: rateColor }]}>
                        {noCapacityWithLoad
                          ? '无产能'
                          : `实 ${Math.round(occupiedUtilizationRate * 100)}%`}
                      </Text>
                      <Text style={[styles.planDayRate, { color: colors.textMuted }]}>
                        计 {Math.round(day.utilizationRate * 100)}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing['3xl'] },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  dateField: { flex: 1 },
  wcCard: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm, ...Shadow.sm },
  wcHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wcName: { fontSize: FontSize.base, fontWeight: '600' },
  avgRate: { fontSize: FontSize.sm, fontWeight: '700' },
  planRate: { fontSize: FontSize.xs },
  riskText: { fontSize: FontSize.xs, fontWeight: '600' },
  resourceSummary: { gap: 2 },
  resourceText: { fontSize: FontSize.xs, fontWeight: '600' },
  daysGrid: { gap: Spacing.xs },
  dayItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dayDate: { fontSize: FontSize.xs, width: 40 },
  dayRateBox: { width: 64, alignItems: 'flex-end' },
  dayRate: { fontSize: FontSize.xs, fontWeight: '600' },
  planDayRate: { fontSize: FontSize.xs },
});
