import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProductionPlanPrecheckResponseDto } from '../../../types/models/ProductionPlanPrecheckResponseDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanRiskSectionProps {
  /** 计划详情内含的配置提醒（橙色提示） */
  configWarnings?: string[];
  /** 下达前预检结果；请求失败时为 null 且 failed=true */
  precheck?: ProductionPlanPrecheckResponseDto | null;
  /** 预检请求是否失败（用于降级提示，不崩溃） */
  failed?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * 计划风险提示（只读，不阻断）：
 * - blockers 硬问题（红）来自下达前预检；
 * - warnings 提示（橙）合并配置提醒与预检提示；
 * - 预检失败时降级为一行灰色提示，不影响其它详情展示。
 */
export function PlanRiskSection({
  configWarnings = [],
  precheck,
  failed = false,
}: PlanRiskSectionProps) {
  const { colors } = useTheme();

  const blockers = precheck?.blockers ?? [];
  const warnings = Array.from(new Set([...configWarnings, ...(precheck?.warnings ?? [])]));

  if (blockers.length === 0 && warnings.length === 0 && !failed) return null;

  return (
    <DetailCard title="风险提示">
      {blockers.map((msg) => (
        <View key={`b-${msg}`} style={[styles.item, { backgroundColor: `${colors.error}15` }]}>
          <Ionicons name="alert-circle" size={16} color={colors.error} />
          <Text style={[styles.text, { color: colors.textSecondary }]}>{msg}</Text>
        </View>
      ))}
      {warnings.map((msg) => (
        <View key={`w-${msg}`} style={[styles.item, { backgroundColor: `${colors.warning}15` }]}>
          <Ionicons name="warning-outline" size={16} color={colors.warning} />
          <Text style={[styles.text, { color: colors.textSecondary }]}>{msg}</Text>
        </View>
      ))}
      {failed && (
        <View style={styles.degraded}>
          <Ionicons name="cloud-offline-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.text, { color: colors.textMuted }]}>
            风险预检暂不可用，请稍后下拉刷新重试
          </Text>
        </View>
      )}
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginBottom: Spacing.xs,
  },
  degraded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  text: { fontSize: FontSize.xs, flex: 1, lineHeight: 18 },
});
