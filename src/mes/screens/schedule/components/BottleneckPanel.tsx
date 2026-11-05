import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { scheduleService } from '../../../host/services';
import { isRequestCanceled } from '../../../host/api-client';
import type { BottleneckItemDto } from '../../../types/generated';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { Badge } from '../../../../core/components/Badge.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { DateRangeQuickSelect } from '../../../../core/components/DateRangeQuickSelect.tsx';
import { DetailCard, InfoRow } from '../../../../core/components/DetailCard.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { daysFromNow, today } from '../../../../core/utils/date';
import { toast } from '../../../../core/toast';
import type { ScheduleAnalysisQuery } from '../types';

export interface BottleneckPanelProps {
  refreshKey: number;
  query?: ScheduleAnalysisQuery;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDefaultDateRange(): { start: string; end: string } {
  return { start: today(), end: daysFromNow(30) };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BottleneckPanel({ refreshKey, query }: BottleneckPanelProps) {
  const { colors } = useTheme();
  const defaults = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [bottlenecks, setBottlenecks] = useState<BottleneckItemDto[]>([]);
  const [threshold, setThreshold] = useState(0.85);
  const [loading, setLoading] = useState(false);
  const isControlledByGantt = Boolean(query);
  const bottleneckLoadGenerationRef = useRef(0);
  const bottleneckLoadRef = useRef<{
    key: string;
    generation: number;
    promise: Promise<void>;
  } | null>(null);

  useEffect(() => {
    if (!query) return;
    setStartDate(query.startDate);
    setEndDate(query.endDate);
  }, [query]);

  const fetchBottleneck = useCallback((): Promise<void> => {
    const requestStartDate = query?.startDate ?? startDate;
    const requestEndDate = query?.endDate ?? endDate;
    if (!requestStartDate || !requestEndDate) return Promise.resolve();

    const params = {
      startDate: requestStartDate,
      endDate: requestEndDate,
      threshold,
      workCenterId: query?.workCenterId,
      workCenterType: query?.workCenterType,
      statuses: query?.statusFilter,
    };
    const key = JSON.stringify(params);
    const existing = bottleneckLoadRef.current;
    if (existing?.key === key) {
      return existing.promise;
    }

    const generation = ++bottleneckLoadGenerationRef.current;
    setLoading(true);
    const promise = scheduleService
      .getBottleneck(params)
      .then((res) => {
        if (generation !== bottleneckLoadGenerationRef.current) return;
        setBottlenecks(res.bottlenecks ?? []);
        setThreshold(res.threshold);
      })
      .catch((e: unknown) => {
        if (generation !== bottleneckLoadGenerationRef.current || isRequestCanceled(e)) return;
        toast.error((e as Error)?.message ?? '获取瓶颈分析失败');
      })
      .finally(() => {
        if (generation === bottleneckLoadGenerationRef.current) {
          setLoading(false);
        }
        if (bottleneckLoadRef.current?.generation === generation) {
          bottleneckLoadRef.current = null;
        }
      });

    bottleneckLoadRef.current = { key, generation, promise };
    return promise;
  }, [endDate, query, startDate, threshold]);

  useFocusEffect(
    useCallback(() => {
      fetchBottleneck();
    }, [fetchBottleneck]),
  );

  useEffect(() => {
    if (refreshKey > 0) {
      fetchBottleneck();
    }
  }, [fetchBottleneck, refreshKey]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={fetchBottleneck} tintColor={colors.primary} />
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

      {!loading && bottlenecks.length === 0 && (
        <View style={[styles.okCard, { backgroundColor: `${colors.success}15` }]}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          <Text style={{ color: colors.success, fontSize: FontSize.sm, fontWeight: '600' }}>
            产能充足，未发现瓶颈工作中心
          </Text>
        </View>
      )}

      {bottlenecks.map((bn) => {
        const avgOccupiedLoad = bn.avgOccupiedUtilization ?? bn.avgUtilization;
        const peakOccupiedLoad = bn.peakOccupiedUtilization ?? bn.peakUtilization;
        const occupiedPeakDate = bn.occupiedPeakDate ?? bn.peakDate;
        const occupiedOverloadDays = bn.occupiedOverloadDays ?? bn.overloadDays;
        const peakPlanLoad = bn.peakUtilization;
        const severity =
          bn.scheduledWithoutCapacity || bn.capacityConstrainedByEquipment || peakPlanLoad > 1.2
            ? 'error'
            : bn.availabilityRisk || peakPlanLoad > 1
              ? 'warning'
              : 'info';
        const severityLabel = bn.scheduledWithoutCapacity
          ? '无产能仍有排产'
          : bn.capacityConstrainedByEquipment
            ? '故障压缩产能'
            : bn.availabilityRisk
              ? '设备冗余下降'
              : severity === 'error'
                ? '计划严重超载'
                : severity === 'warning'
                  ? '计划超载'
                  : '计划高负荷';
        return (
          <DetailCard
            key={bn.workCenterId ?? undefined}
            title={bn.workCenterName ?? ''}
            style={styles.card}
          >
            <InfoRow
              label="严重程度"
              right={<Badge label={severityLabel} variant={severity} size="sm" />}
            />
            <InfoRow label="计划平均负荷" value={`${Math.round(bn.avgUtilization * 100)}%`} />
            <InfoRow label="实际平均占用" value={`${Math.round(avgOccupiedLoad * 100)}%`} />
            <InfoRow
              label="计划峰值"
              value={`${Math.round(bn.peakUtilization * 100)}%（${bn.peakDate}）`}
            />
            <InfoRow
              label="实际占用峰值"
              value={`${Math.round(peakOccupiedLoad * 100)}%（${occupiedPeakDate}）`}
            />
            <InfoRow
              label="计划超载天数"
              value={`${bn.overloadDays} / ${bn.totalWorkingDays} 天`}
            />
            <InfoRow
              label="实际超载天数"
              value={`${occupiedOverloadDays} / ${bn.totalWorkingDays} 天`}
            />
            <InfoRow
              label="设备可用"
              value={`${bn.availableEquipmentCount} / ${bn.totalEquipmentCount} 台`}
            />
            <InfoRow
              label="有效并发"
              value={`${bn.effectiveConcurrency} / ${bn.configuredConcurrency}`}
            />
            {bn.suggestions.length > 0 && (
              <View style={styles.suggestionsBox}>
                <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>
                  优化建议
                </Text>
                {bn.suggestions.map((s) => (
                  <View key={s} style={styles.suggestionRow}>
                    <Ionicons name="bulb-outline" size={13} color={colors.warning} />
                    <Text style={[styles.suggestionText, { color: colors.text }]}>{s}</Text>
                  </View>
                ))}
              </View>
            )}
          </DetailCard>
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
  card: { marginBottom: 0 },
  okCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  suggestionsBox: { marginTop: Spacing.xs, gap: Spacing.xs },
  suggestionsTitle: { fontSize: FontSize.xs, fontWeight: '600' },
  suggestionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs },
  suggestionText: { fontSize: FontSize.xs, flex: 1, lineHeight: 18 },
});
