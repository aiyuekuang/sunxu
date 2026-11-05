import { StyleSheet, View } from 'react-native';
import type { PlanAchievementDto } from '../../../types/models/PlanAchievementDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber } from '../../../../core/utils/format';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanAchievementSectionProps {
  achievement?: PlanAchievementDto | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** 完成率归一为 0-100 整数（后端 decimal 可能返回 string）。 */
function toRatePct(rate: number | string): number {
  const num = Number(rate);
  if (!Number.isFinite(num)) return 0;
  return Math.round(Math.min(Math.max(num, 0), 100));
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * 计划达成率三级展示：计划级完成率 + 来源需求行达成 + 批次达成（App 端只读）。
 * 数据来源计划详情内含的 achievement，避免额外请求。
 */
export function PlanAchievementSection({ achievement }: PlanAchievementSectionProps) {
  const { colors } = useTheme();
  if (!achievement) return null;

  const planPct = toRatePct(achievement.completionRate);
  const planColor = achievement.requirementFulfilled ? colors.success : colors.primary;
  const demandLines = achievement.demandLines ?? [];
  const releaseLines = achievement.releaseLines ?? [];

  return (
    <DetailCard title="达成率">
      {/* 计划级 */}
      <View style={styles.planHeader}>
        <Text style={[styles.planLabel, { color: colors.textSecondary }]}>
          {achievement.requirementFulfilled ? '需求已满足' : '需求达成'}
        </Text>
        <Text style={[styles.planPct, { color: planColor }]}>{planPct}%</Text>
      </View>
      <View style={[styles.bar, { backgroundColor: colors.border }]}>
        <View style={[styles.barFill, { width: `${planPct}%`, backgroundColor: planColor }]} />
      </View>
      <Text style={[styles.planQty, { color: colors.textSecondary }]}>
        良品 {formatNumber(achievement.completedQty)} / {formatNumber(achievement.requiredQty)}
      </Text>

      {/* 来源需求行达成 */}
      {demandLines.length > 0 && (
        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: colors.textMuted }]}>
            来源需求 ({demandLines.length})
          </Text>
          {demandLines.map((line) => {
            const pct = toRatePct(line.completionRate);
            return (
              <View
                key={line.demandLineId}
                style={[styles.lineRow, { borderBottomColor: colors.border }]}
              >
                <View style={styles.lineLeft}>
                  <Text
                    style={[styles.lineTitle, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {line.sourceOrderNo ||
                      (line.sourceType === 'direct_plan' ? '直接计划' : line.sourceType)}
                  </Text>
                  {line.customerName ? (
                    <Text style={[styles.lineSub, { color: colors.textMuted }]} numberOfLines={1}>
                      {line.customerName}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.lineRight}>
                  <Text style={[styles.lineQty, { color: colors.textSecondary }]}>
                    {formatNumber(line.fulfilledQty)}/{formatNumber(line.requiredQty)}
                  </Text>
                  <Text style={[styles.linePct, { color: colors.primary }]}>{pct}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 批次达成 */}
      {releaseLines.length > 0 && (
        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: colors.textMuted }]}>
            批次达成 ({releaseLines.length})
          </Text>
          {releaseLines.map((line) => {
            const pct = toRatePct(line.completionRate);
            return (
              <View
                key={line.releaseLineId}
                style={[styles.lineRow, { borderBottomColor: colors.border }]}
              >
                <Text style={[styles.lineTitle, { color: colors.primary }]} numberOfLines={1}>
                  {line.releaseNo}
                </Text>
                <View style={styles.lineRight}>
                  <Text style={[styles.lineQty, { color: colors.textSecondary }]}>
                    {formatNumber(line.completedGoodQty)}/{formatNumber(line.plannedQty)}
                  </Text>
                  <Text style={[styles.linePct, { color: colors.primary }]}>{pct}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planLabel: { fontSize: FontSize.xs },
  planPct: { fontSize: FontSize.sm, fontWeight: '700' },
  bar: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: Spacing.xs },
  barFill: { height: 6, borderRadius: 3 },
  planQty: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  group: { marginTop: Spacing.md },
  groupTitle: { fontSize: FontSize.xs, fontWeight: '600', marginBottom: 2 },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
  },
  lineLeft: { flex: 1, gap: 2 },
  lineTitle: { fontSize: FontSize.sm, fontWeight: '500' },
  lineSub: { fontSize: FontSize.xs },
  lineRight: { alignItems: 'flex-end', gap: 2 },
  lineQty: { fontSize: FontSize.sm },
  linePct: { fontSize: FontSize.xs, fontWeight: '600' },
});
