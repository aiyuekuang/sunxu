import { Ionicons } from '@expo/vector-icons';
import {
  type DimensionValue,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from 'react-native';
import type { WorkOrderOperation } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { Badge } from '../../../../core/components/Badge.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { WORK_ORDER_OP_STATUS } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber } from '../../../../core/utils/format';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MyOperationsSectionProps {
  operations: WorkOrderOperation[];
  onPress: (op: WorkOrderOperation) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MyOperationsSection({ operations, onPress }: MyOperationsSectionProps) {
  const { colors } = useTheme();

  if (operations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Ionicons name="construct-outline" size={16} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>我的待报工</Text>
        </View>
        <EmptyState compact icon="checkmark-done-outline" title="暂无待报工工序" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Ionicons name="construct-outline" size={16} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>我的待报工</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
          <RNText
            numberOfLines={1}
            allowFontScaling={false}
            style={[styles.countText, { color: colors.textOnPrimary }]}
          >
            {operations.length}
          </RNText>
        </View>
      </View>

      {operations.map((op) => {
        const wo = op.workOrder;
        const opCfg = WORK_ORDER_OP_STATUS[op.status] ?? {
          label: '未知状态',
          color: colors.textMuted,
        };
        const progressMetrics = {
          reportedQty: Number(op.reportedQty ?? 0),
          effectiveQty: Number(op.effectiveQty ?? 0),
          scrappedQty: Number(op.scrappedQty ?? 0),
          progress: Number(op.progress ?? 0),
        };
        const pct = progressMetrics.progress;
        const materialName = wo?.material?.name ?? '';
        const orderNo = wo?.orderNo ?? '';
        const isPlanEndOverdue = wo?.planEndTime && new Date(wo.planEndTime).getTime() < Date.now();

        return (
          <TouchableOpacity
            key={op.id}
            style={[
              styles.opCard,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
            onPress={() => onPress(op)}
          >
            <View style={styles.opHeader}>
              <Text style={[styles.opName, { color: colors.text }]} numberOfLines={1}>
                {op.operationName}
              </Text>
              <Badge label={opCfg.label} color={opCfg.color} size="sm" />
            </View>

            {materialName ? (
              <Text
                style={[styles.materialName, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {materialName}
              </Text>
            ) : null}

            <View style={styles.opMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="document-text-outline" size={11} color={colors.textTertiary} />
                <Text style={[styles.metaText, { color: colors.textTertiary }]}>{orderNo}</Text>
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {formatNumber(progressMetrics.reportedQty, { maximumFractionDigits: 4 })}/
                {formatNumber(progressMetrics.effectiveQty, { maximumFractionDigits: 4 })} ({pct}%)
                {progressMetrics.scrappedQty > 0
                  ? ` · 废${formatNumber(progressMetrics.scrappedQty, {
                      maximumFractionDigits: 4,
                    })}`
                  : ''}
              </Text>
              {isPlanEndOverdue && (
                <View style={[styles.overdueBadge, { backgroundColor: `${colors.error}18` }]}>
                  <Text style={[styles.overdueText, { color: colors.error }]}>计划超时</Text>
                </View>
              )}
            </View>

            {/* Mini progress */}
            <View style={[styles.miniTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.miniFill,
                  {
                    width: `${Math.min(pct, 100)}%` as DimensionValue,
                    backgroundColor: opCfg.color,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  title: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: { fontSize: FontSize.xs, fontWeight: '700' },
  opCard: {
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: Spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
  },
  opHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  opName: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  materialName: { fontSize: FontSize.xs },
  opMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: FontSize.xs },
  progressText: { fontSize: FontSize.xs, fontWeight: '500' },
  overdueBadge: { paddingHorizontal: Spacing.xs, paddingVertical: 1, borderRadius: 4 },
  overdueText: { fontSize: FontSize.xs, fontWeight: '600' },
  miniTrack: { height: 3, borderRadius: 2, overflow: 'hidden' },
  miniFill: { height: 3, borderRadius: 2 },
});
