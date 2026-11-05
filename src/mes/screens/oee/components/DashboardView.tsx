import { useCallback, useEffect, useState } from 'react';
import { type DimensionValue, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { type OeeDashboard, oeeService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { DateRangeQuickSelect } from '../../../../core/components/DateRangeQuickSelect.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate, toDateStr } from '../../../../core/utils/date';
import { toast } from '../../../../core/toast';
import { OeeGauge } from './OeeGauge.tsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateStr(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toDateStr(d);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardView() {
  const { colors } = useTheme();
  const [dashboard, setDashboard] = useState<OeeDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(getDateStr(-29));
  const [endDate, setEndDate] = useState(getDateStr(0));

  const fetchDashboard = useCallback(async (sd: string, ed: string) => {
    setLoading(true);
    try {
      const raw = await oeeService.dashboard({
        startDate: sd || undefined,
        endDate: ed || undefined,
      });
      // 后端可能返回 { overall: {...}, byEquipment } 或扁平结构
      // 值是 0-1 小数，需要转换为 0-100 百分比
      const overall = raw.overall as Record<string, number>;
      const rawByEquipment = (raw.byEquipment ?? []) as Array<
        NonNullable<typeof raw.byEquipment>[number] & {
          trend?: Array<{ date: string; oee: number }>;
        }
      >;
      const byEquipment = rawByEquipment.map((eq) => ({
        ...eq,
        avgOee: (eq.avgOee ?? 0) * 100,
      }));
      // 从 byEquipment 的 trend 或顶层 trend 汇总趋势
      const trendMap = new Map<string, { date: string; total: number; count: number }>();
      const trendSource = raw.trend ?? [];
      if (trendSource.length > 0) {
        for (const pt of trendSource) {
          trendMap.set(pt.date, { date: pt.date, total: pt.oee, count: 1 });
        }
      } else {
        for (const eq of rawByEquipment) {
          for (const pt of eq.trend ?? []) {
            const key = pt.date;
            if (!trendMap.has(key)) trendMap.set(key, { date: key, total: 0, count: 0 });
            const entry = trendMap.get(key) ?? { date: key, total: 0, count: 0 };
            entry.total += pt.oee;
            entry.count += 1;
          }
        }
      }
      const trend = Array.from(trendMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((t) => ({ date: t.date, oee: (t.total / t.count) * 100 }));

      setDashboard({
        avgOee: (overall.avgOee ?? 0) * 100,
        avgAvailability: (overall.avgAvailability ?? 0) * 100,
        avgPerformance: (overall.avgPerformance ?? 0) * 100,
        avgQualityRate: (overall.avgQuality ?? overall.avgQualityRate ?? 0) * 100,
        byEquipment,
        trend,
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '加载OEE数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(startDate, endDate);
  }, [endDate, fetchDashboard, startDate]);

  if (loading) {
    return <InlineLoading />;
  }

  if (!dashboard) {
    return <EmptyState compact icon="analytics-outline" title="暂无OEE数据" />;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 }}>
      {/* 日期筛选 */}
      <View style={[dashStyles.dateBar, { backgroundColor: colors.surface }]}>
        <View style={dashStyles.dateRow}>
          <View style={dashStyles.dateField}>
            <DatePickerField
              label="开始"
              value={startDate}
              onChange={setStartDate}
              showCurrentShortcut={false}
              placeholder="选择日期"
            />
          </View>
          <View style={dashStyles.dateField}>
            <DatePickerField
              label="结束"
              value={endDate}
              onChange={setEndDate}
              showCurrentShortcut={false}
              placeholder="选择日期"
            />
          </View>
        </View>
        <DateRangeQuickSelect
          onSelect={([start, end]) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
        <TouchableOpacity
          style={[dashStyles.queryBtn, { backgroundColor: colors.primary }]}
          onPress={() => fetchDashboard(startDate, endDate)}
        >
          <Text style={[dashStyles.queryBtnText, { color: colors.textOnPrimary }]}>查询</Text>
        </TouchableOpacity>
      </View>

      {/* Overall OEE */}
      <View style={[styles.oeeCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>综合OEE</Text>
        <Text
          style={[
            styles.oeeMainValue,
            {
              color:
                dashboard.avgOee >= 85
                  ? colors.success
                  : dashboard.avgOee >= 70
                    ? colors.warning
                    : colors.error,
            },
          ]}
        >
          {dashboard.avgOee.toFixed(1)}%
        </Text>
        <Text style={[styles.oeeTarget, { color: colors.textMuted }]}>目标: ≥85%</Text>
      </View>

      {/* Breakdown */}
      <View style={[styles.oeeCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>三率分析</Text>
        <OeeGauge value={dashboard.avgAvailability} label="时间开动率 (Availability)" />
        <OeeGauge value={dashboard.avgPerformance} label="性能开动率 (Performance)" />
        <OeeGauge value={dashboard.avgQualityRate} label="合格品率 (Quality Rate)" />
      </View>

      {/* By Equipment */}
      {dashboard.byEquipment?.length > 0 && (
        <View style={[styles.oeeCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>设备OEE排名</Text>
          {dashboard.byEquipment.map((eq, i) => (
            <View key={eq.equipmentId} style={[styles.eqRow, { borderBottomColor: colors.border }]}>
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: i < 3 ? `${colors.primary}20` : colors.border },
                ]}
              >
                <Text
                  style={[styles.rankText, { color: i < 3 ? colors.primary : colors.textMuted }]}
                >
                  {i + 1}
                </Text>
              </View>
              <Text style={[styles.eqName, { color: colors.text }]} numberOfLines={1}>
                {eq.equipmentName}
              </Text>
              <View style={{ flex: 1 }}>
                <View style={[styles.eqBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.eqBarFill,
                      {
                        width: `${Math.min(eq.avgOee, 100)}%` as DimensionValue,
                        backgroundColor:
                          eq.avgOee >= 85
                            ? colors.success
                            : eq.avgOee >= 70
                              ? colors.warning
                              : colors.error,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.eqOeeValue, { color: colors.text }]}>
                {eq.avgOee.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Trend */}
      {dashboard.trend?.length > 0 && (
        <View style={[styles.oeeCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>OEE 趋势</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View
              style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingBottom: 20 }}
            >
              {dashboard.trend.map((pt) => {
                const h = Math.max((pt.oee / 100) * 80, 4);
                const color =
                  pt.oee >= 85 ? colors.success : pt.oee >= 70 ? colors.warning : colors.error;
                return (
                  <View key={pt.date} style={{ alignItems: 'center', gap: 4 }}>
                    <Text style={[styles.trendValue, { color }]}>{pt.oee.toFixed(0)}%</Text>
                    <View style={[styles.trendBar, { height: h, backgroundColor: color }]} />
                    <Text style={[styles.trendDate, { color: colors.textMuted }]}>
                      {formatDate(pt.date)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const dashStyles = StyleSheet.create({
  dateBar: { borderRadius: Radius.md, padding: Spacing.sm, gap: Spacing.sm, ...Shadow.sm },
  dateRow: { flexDirection: 'row', gap: Spacing.sm },
  dateField: { flex: 1 },
  queryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center' as const,
  },
  queryBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
});

const styles = StyleSheet.create({
  oeeCard: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  oeeMainValue: { fontSize: FontSize.display, fontWeight: '800', textAlign: 'center' },
  oeeTarget: { fontSize: FontSize.xs, textAlign: 'center' },
  eqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: FontSize.xs, fontWeight: '700' },
  eqName: { width: 80, fontSize: FontSize.xs },
  eqBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  eqBarFill: { height: 6, borderRadius: 3 },
  eqOeeValue: { fontSize: FontSize.xs, fontWeight: '600', minWidth: 40, textAlign: 'right' },
  trendValue: { fontSize: FontSize.xs, fontWeight: '600' },
  trendBar: { width: 24, borderRadius: 2 },
  trendDate: { fontSize: FontSize.xs },
});
