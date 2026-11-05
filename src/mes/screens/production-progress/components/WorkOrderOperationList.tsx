import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { WorkOrderOperation } from '../../../host/services';
import { workOrderService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { ProgressBar } from '../../../../core/components/ProgressBar.tsx';
import { WORK_ORDER_OP_STATUS, WORK_ORDER_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber } from '../../../../core/utils/format';
import { toast } from '../../../../core/toast';
import type { WorkOrderSummary } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkOrderOperationListProps {
  workOrders: WorkOrderSummary[];
  materialUnit: string;
  onWorkOrderPress: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkOrderOperationList({
  workOrders,
  materialUnit,
  onWorkOrderPress,
}: WorkOrderOperationListProps) {
  const { colors } = useTheme();
  const [expandedWoId, setExpandedWoId] = useState<string | null>(null);
  const [operationsMap, setOperationsMap] = useState<Record<string, WorkOrderOperation[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const toggleWorkOrder = useCallback(
    async (woId: string) => {
      if (expandedWoId === woId) {
        setExpandedWoId(null);
        return;
      }
      setExpandedWoId(woId);
      if (!operationsMap[woId]) {
        setLoadingMap((prev) => ({ ...prev, [woId]: true }));
        try {
          const ops = await workOrderService.getOperations(woId);
          setOperationsMap((prev) => ({ ...prev, [woId]: ops }));
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : '加载工序失败');
        } finally {
          setLoadingMap((prev) => ({ ...prev, [woId]: false }));
        }
      }
    },
    [expandedWoId, operationsMap],
  );

  return (
    <View style={styles.container}>
      {workOrders.map((wo) => {
        const woProgress = Math.min(Math.round(wo.overallProgress), 100);
        const isExpanded = expandedWoId === wo.id;
        const ops = operationsMap[wo.id];
        const isLoadingOps = loadingMap[wo.id];

        return (
          <View key={wo.id} style={[styles.woBlock, { borderColor: colors.borderLight }]}>
            {/* 工单行 */}
            <TouchableOpacity
              style={styles.woHeader}
              activeOpacity={0.7}
              onPress={() => toggleWorkOrder(wo.id)}
            >
              <View style={styles.woLeft}>
                <TouchableOpacity onPress={() => onWorkOrderPress(wo.id)} activeOpacity={0.7}>
                  <Text style={[styles.woNo, { color: colors.primary }]}>{wo.orderNo}</Text>
                </TouchableOpacity>
                <ConfigBadge value={wo.status} config={WORK_ORDER_STATUS_CONFIG} size="sm" />
              </View>
              <View style={styles.woRight}>
                <Text style={[styles.woProgressText, { color: colors.textSecondary }]}>
                  {woProgress}%
                </Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={colors.textMuted}
                />
              </View>
            </TouchableOpacity>

            {/* 工单进度条 */}
            <View style={styles.woProgressBar}>
              <ProgressBar current={woProgress} target={100} height={3} />
            </View>

            {/* 展开：工序列表 */}
            {isExpanded && (
              <View style={[styles.opsContainer, { backgroundColor: colors.background }]}>
                {isLoadingOps ? (
                  <InlineLoading />
                ) : ops && ops.length > 0 ? (
                  ops
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((op) => {
                      const progressMetrics = {
                        reportedQty: Number(op.reportedQty ?? 0),
                        effectiveQty: Number(op.effectiveQty ?? 0),
                        scrappedQty: Number(op.scrappedQty ?? 0),
                        progress: Number(op.progress ?? 0),
                      };
                      const opPct = progressMetrics.progress;
                      return (
                        <View
                          key={op.id}
                          style={[styles.opRow, { borderBottomColor: colors.border }]}
                        >
                          <View style={styles.opLeft}>
                            <View style={[styles.opStep, { backgroundColor: colors.primary }]}>
                              <Text style={[styles.opStepText, { color: colors.textOnPrimary }]}>
                                {op.sequence}
                              </Text>
                            </View>
                            <View style={styles.opInfo}>
                              <View style={styles.opNameRow}>
                                <Text
                                  style={[styles.opName, { color: colors.text }]}
                                  numberOfLines={1}
                                >
                                  {op.operationName}
                                </Text>
                                <ConfigBadge
                                  value={op.status as string}
                                  config={WORK_ORDER_OP_STATUS}
                                  size="sm"
                                />
                              </View>
                              <View style={styles.opProgressRow}>
                                <View style={styles.opProgressBar}>
                                  <ProgressBar
                                    current={progressMetrics.reportedQty}
                                    target={progressMetrics.effectiveQty}
                                    height={3}
                                  />
                                </View>
                                <Text style={[styles.opProgressText, { color: colors.textMuted }]}>
                                  {formatNumber(progressMetrics.reportedQty, {
                                    maximumFractionDigits: 4,
                                  })}
                                  /
                                  {formatNumber(progressMetrics.effectiveQty, {
                                    maximumFractionDigits: 4,
                                  })}{' '}
                                  {materialUnit} ({opPct}%)
                                  {progressMetrics.scrappedQty > 0
                                    ? ` · 废${formatNumber(progressMetrics.scrappedQty, {
                                        maximumFractionDigits: 4,
                                      })}`
                                    : ''}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      );
                    })
                ) : (
                  <Text style={[styles.noOps, { color: colors.textMuted }]}>暂无工序</Text>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  woBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  woHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  woLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  woRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  woNo: { fontSize: FontSize.xs, fontWeight: '600' },
  woProgressText: { fontSize: FontSize.xs, fontWeight: '500' },
  woProgressBar: { paddingHorizontal: Spacing.sm, paddingBottom: Spacing.xs },
  opsContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  opRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  opLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs },
  opStep: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  opStepText: { fontSize: FontSize.xs, fontWeight: '700' },
  opInfo: { flex: 1, gap: 3 },
  opNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  opName: { fontSize: FontSize.xs, fontWeight: '500', flex: 1 },
  opProgressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  opProgressBar: { flex: 1 },
  opProgressText: { fontSize: FontSize.xs, minWidth: 80 },
  noOps: { fontSize: FontSize.xs, textAlign: 'center', paddingVertical: Spacing.sm },
});
