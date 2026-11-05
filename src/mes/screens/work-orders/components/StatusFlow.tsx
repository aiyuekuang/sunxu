import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { WORK_ORDER_SPECIAL_STATUS, WORK_ORDER_STATUS_FLOW } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatusFlowProps {
  currentStatus: string;
  /** 后端派生展示态（如 pending_release） */
  statusDisplay?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StatusFlow({ currentStatus, statusDisplay }: StatusFlowProps) {
  const { colors } = useTheme();

  // 特殊状态（暂停/取消）不在主流程中，显示在旁边
  const special = WORK_ORDER_SPECIAL_STATUS[currentStatus];
  const currentIdx = WORK_ORDER_STATUS_FLOW.findIndex((s) => s.key === currentStatus);
  // 终态：当前节点是最后一个流程节点，视为已完成（绿色✓），不显示蓝色
  const isTerminalState = currentIdx === WORK_ORDER_STATUS_FLOW.length - 1;
  const isPendingRelease = currentStatus === 'submitted' && statusDisplay === 'pending_release';

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.flowRow}>
        {WORK_ORDER_STATUS_FLOW.map((step, idx) => {
          const displayLabel = step.key === 'submitted' && isPendingRelease ? '待下达' : step.label;
          const isPast = currentIdx >= 0 && idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const _isFuture = currentIdx >= 0 && idx > currentIdx;
          // If special status (paused/cancelled), highlight the step that was active before
          const isActiveSpecial =
            special &&
            ((currentStatus === 'paused' && step.key === 'in_progress') ||
              (currentStatus === 'cancelled' && idx === 0));

          // 审批通过但尚未下达时，"审批中"节点视为已完成（避免蓝色/审批已通过 矛盾信号）
          const isApprovalDone = step.key === 'submitted' && isPendingRelease;

          // 终态或审批已过时，当前节点也算"已完成"
          const isCompleted = isPast || (isCurrent && isTerminalState) || isApprovalDone;

          const dotColor = isCompleted
            ? colors.success
            : isCurrent
              ? colors.primary
              : isActiveSpecial
                ? colors.warning
                : colors.border;

          const labelColor = isCompleted
            ? colors.success
            : isCurrent
              ? colors.primary
              : isActiveSpecial
                ? colors.warning
                : colors.textTertiary;

          return (
            <View key={step.key} style={styles.stepItem}>
              <View style={styles.dotRow}>
                {idx > 0 && (
                  <View
                    style={[
                      styles.line,
                      { backgroundColor: isPast || isCurrent ? colors.success : colors.border },
                    ]}
                  />
                )}
                <View style={[styles.dot, { backgroundColor: dotColor }]}>
                  {isCompleted && (
                    <Text style={[styles.checkmark, { color: colors.textOnPrimary }]}>✓</Text>
                  )}
                  {isCurrent && !isTerminalState && !isCompleted && (
                    <View style={[styles.innerDot, { backgroundColor: colors.surface }]} />
                  )}
                </View>
                {idx < WORK_ORDER_STATUS_FLOW.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      { backgroundColor: isPast && !isCurrent ? colors.success : colors.border },
                    ]}
                  />
                )}
              </View>
              <Text
                style={[styles.label, { color: labelColor }, isCurrent && styles.labelBold]}
                numberOfLines={1}
              >
                {displayLabel}
              </Text>
            </View>
          );
        })}
      </View>
      {special && (
        <View style={[styles.specialBadge, { backgroundColor: `${colors.warning}18` }]}>
          <Text style={[styles.specialText, { color: colors.warning }]}>当前：{special}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base, gap: Spacing.xs },
  flowRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepItem: { flex: 1, alignItems: 'center', gap: Spacing.xs },
  dotRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  innerDot: { width: 6, height: 6, borderRadius: 3 },
  checkmark: { fontSize: FontSize.xs, fontWeight: '700' },
  line: { flex: 1, height: 2 },
  label: { fontSize: FontSize.xs, textAlign: 'center' },
  labelBold: { fontWeight: '700', fontSize: FontSize.xs },
  specialBadge: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.md,
  },
  specialText: { fontSize: FontSize.xs, fontWeight: '600' },
});
