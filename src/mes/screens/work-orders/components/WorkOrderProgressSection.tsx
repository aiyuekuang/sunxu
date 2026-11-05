import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { WorkOrderDetail } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ProgressBar } from '../../../../core/components/ProgressBar.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate } from '../../../../core/utils/date';
import { formatNumber } from '../../../../core/utils/format';
import { getDisplayCompletedQty, getDisplayScrappedQty } from '../work-order-metrics';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkOrderProgressSectionProps {
  order: WorkOrderDetail;
  materialUnit: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkOrderProgressSection({ order, materialUnit }: WorkOrderProgressSectionProps) {
  const { colors } = useTheme();

  const progressPct = Math.min(Math.round(order.overallProgress), 100);
  const completedQty = getDisplayCompletedQty(order);
  const scrappedQty = getDisplayScrappedQty(order);

  const isPlanEndOverdue = order.status === 'in_progress' && order.planEndOverdue;

  return (
    <View style={[styles.progressCard, { backgroundColor: colors.surface }, Shadow.sm]}>
      <View style={styles.progressHeader}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
          {order.material?.name}
        </Text>
        <Text style={[styles.progressPct, { color: colors.primary }]}>{progressPct}%</Text>
      </View>
      <ProgressBar current={order.overallProgress} target={100} height={6} />
      <View style={styles.qtyRow}>
        <Text style={[styles.qtyText, { color: colors.textSecondary }]}>
          良品 {formatNumber(completedQty, { maximumFractionDigits: 4 })} / 投产{' '}
          {formatNumber(order.plannedQty, { maximumFractionDigits: 4 })} {materialUnit}
        </Text>
        {scrappedQty > 0 && (
          <Text style={[styles.qtyText, { color: colors.error }]}>
            报废 {formatNumber(scrappedQty, { maximumFractionDigits: 4 })} {materialUnit}
          </Text>
        )}
      </View>
      {order.planStartTime && order.planEndTime && (
        <View style={[styles.timeRow, { borderTopColor: colors.border }]}>
          <Ionicons name="time-outline" size={13} color={colors.textTertiary} />
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatDate(order.planStartTime)} ~ {formatDate(order.planEndTime)}
          </Text>
          {isPlanEndOverdue && (
            <View style={[styles.overdueBadge, { backgroundColor: `${colors.error}18` }]}>
              <Text style={[styles.overdueText, { color: colors.error }]}>计划超时</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  progressCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 6,
    marginHorizontal: Spacing.sm,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productName: { fontSize: FontSize.md, fontWeight: '700', flex: 1 },
  progressPct: { fontSize: FontSize.xl, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  qtyText: { fontSize: FontSize.sm },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  timeText: { fontSize: FontSize.xs, flex: 1 },
  overdueBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
  overdueText: { fontSize: FontSize.xs, fontWeight: '600' },
});
