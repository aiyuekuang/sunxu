import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { ScanOperationInfoDto } from '../../../types/models/ScanOperationInfoDto';
import type { ScanParseResult } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { ProgressBar } from '../../../../core/components/ProgressBar.tsx';
import { WORK_ORDER_OP_STATUS, WORK_ORDER_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatNumber } from '../../../../core/utils/format';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkOrderResultCardProps {
  result: ScanParseResult;
  canReportPermission: boolean;
  onNavigate: () => void;
  onReportOperation: (operationId: string) => void;
  onClose: () => void;
}

function formatQty(value?: number | null): string {
  return formatNumber(value, { fallback: '0', maximumFractionDigits: 4 });
}

function formatScanTooling(op: ScanOperationInfoDto): string | null {
  const sessions = op.runningToolingSessions ?? [];
  if (sessions.length === 0) return null;
  return sessions
    .map((session) => session.toolingCode ?? session.toolingName ?? session.toolingId)
    .filter(Boolean)
    .join('、');
}

// ─── Component ────────────────────────────────────────────────────────────────

export const WorkOrderResultCard = React.memo(function WorkOrderResultCard({
  result,
  canReportPermission,
  onNavigate,
  onReportOperation,
  onClose,
}: WorkOrderResultCardProps) {
  const { colors } = useTheme();
  const { formatUnit } = useUnitDisplay('material');
  const wo = result.workOrder;
  if (!wo) {
    return null;
  }
  const ops = result.operations ?? [];
  const pct = Math.min(Math.round(wo.progress), 100);
  const canReport = canReportPermission && wo.status === 'in_progress';
  const reportHint = !canReportPermission
    ? '当前账号没有报工权限，仅可查看工单详情'
    : wo.status !== 'in_progress'
      ? '工单未开工，暂不可报工'
      : null;

  return (
    <BottomSheet visible onClose={onClose} title="工单扫码" dynamicHeight>
      <View style={styles.content}>
        {/* 工单信息 */}
        <View style={[styles.card, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.orderNo, { color: colors.primary }]}>{wo.orderNo}</Text>
            <Text
              style={[
                styles.statusText,
                { color: WORK_ORDER_STATUS_CONFIG[wo.status]?.color ?? colors.textMuted },
              ]}
            >
              {WORK_ORDER_STATUS_CONFIG[wo.status]?.label ?? '未知状态'}
            </Text>
          </View>
          <Text style={[styles.productName, { color: colors.text }]}>{wo.materialName}</Text>
          <View style={styles.progressSection}>
            <ProgressBar current={wo.progress} target={100} height={5} />
            <View style={styles.progressLabels}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                已报工 {formatQty(wo.reportedQty)} / {formatQty(wo.plannedQty)}{' '}
                {formatUnit(wo.materialUnit)}
              </Text>
              <Text style={[styles.progressPct, { color: colors.primary }]}>{pct}%</Text>
            </View>
          </View>
        </View>

        {/* 工序列表 */}
        {ops.length > 0 ? (
          <View style={styles.opsSection}>
            <Text style={[styles.opsSectionTitle, { color: colors.textSecondary }]}>
              选择工序报工
            </Text>
            {ops.map((op) => (
              <OperationRow
                key={op.id}
                op={op}
                canReport={canReport}
                materialUnit={formatUnit(wo.materialUnit)}
                onReport={() => onReportOperation(op.id)}
              />
            ))}
            {reportHint && (
              <Text style={[styles.hintText, { color: colors.textMuted }]}>{reportHint}</Text>
            )}
          </View>
        ) : (
          <EmptyState compact icon="list-outline" title="暂无工序" />
        )}

        {/* 底部操作 */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>继续扫码</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.border }]}
            onPress={onNavigate}
          >
            <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>工单详情</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
});

// ─── OperationRow ─────────────────────────────────────────────────────────────

interface OperationRowProps {
  op: ScanOperationInfoDto;
  canReport: boolean;
  materialUnit: string | null | undefined;
  onReport: () => void;
}

const OperationRow = React.memo(function OperationRow({
  op,
  canReport,
  materialUnit,
  onReport,
}: OperationRowProps) {
  const { colors } = useTheme();
  const isCompleted = op.status === 'completed';
  const isSkipped = op.status === 'skipped';
  const showReportBtn = canReport && op.canReport;
  const statusCfg = WORK_ORDER_OP_STATUS[op.status];
  const toolingText = formatScanTooling(op);

  return (
    <View style={[styles.opRow, { backgroundColor: colors.surfaceSecondary }]}>
      <View style={styles.opInfo}>
        <View style={styles.opTitleRow}>
          <View style={[styles.seqBadge, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={[styles.seqText, { color: colors.primary }]}>#{op.sequence}</Text>
          </View>
          <Text
            style={[
              styles.opName,
              { color: isCompleted || isSkipped ? colors.textMuted : colors.text },
            ]}
            numberOfLines={1}
          >
            {op.operationName}
          </Text>
          <Text style={[styles.opStatus, { color: statusCfg?.color ?? colors.textMuted }]}>
            {statusCfg?.label ?? '未知状态'}
          </Text>
        </View>
        <View style={styles.opQtyRow}>
          <Text style={[styles.opQtyLabel, { color: colors.textSecondary }]}>
            已报工 {op.reportedQty} / {op.effectiveQty}
            {op.maxReportQty > 0 ? ` / 可报 ${op.maxReportQty}` : ''} {materialUnit ?? ''}
          </Text>
          {op.scrappedQty > 0 && (
            <Text style={[styles.opQtyLabel, { color: colors.error }]}>报废 {op.scrappedQty}</Text>
          )}
        </View>
        {(op.dependencySummary || op.qualityBlockReason || toolingText) && (
          <View style={styles.opMetaList}>
            {op.dependencySummary ? (
              <Text style={[styles.opMetaText, { color: colors.textSecondary }]}>
                前置 {op.dependencySummary}
              </Text>
            ) : null}
            {op.qualityBlockReason ? (
              <Text style={[styles.opMetaText, { color: colors.error }]}>
                {op.qualityBlockReason}
              </Text>
            ) : null}
            {toolingText ? (
              <Text style={[styles.opMetaText, { color: colors.textSecondary }]}>
                工装 {toolingText}
              </Text>
            ) : null}
          </View>
        )}
      </View>
      {showReportBtn && (
        <TouchableOpacity
          style={[styles.reportBtn, { backgroundColor: colors.success }]}
          onPress={onReport}
        >
          <Ionicons name="checkmark-circle-outline" size={14} color={colors.textOnPrimary} />
          <Text style={[styles.reportBtnText, { color: colors.textOnPrimary }]}>报工</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: { padding: Spacing.md, gap: Spacing.sm },
  card: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs, ...Shadow.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderNo: { fontSize: FontSize.sm, fontWeight: '600' },
  statusText: { fontSize: FontSize.sm, fontWeight: '600' },
  productName: { fontSize: FontSize.md, fontWeight: '700' },
  progressSection: { gap: Spacing.xs },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: FontSize.xs },
  progressPct: { fontSize: FontSize.xs, fontWeight: '600' },

  opsSection: { gap: Spacing.xs },
  opsSectionTitle: { fontSize: FontSize.xs, fontWeight: '600', paddingLeft: Spacing.xs },
  opRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  opInfo: { flex: 1, gap: 2 },
  opTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  seqBadge: { paddingHorizontal: Spacing.xs, paddingVertical: 1, borderRadius: Radius.sm },
  seqText: { fontSize: FontSize.xs, fontWeight: '700' },
  opName: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  opStatus: { fontSize: FontSize.xs, fontWeight: '600' },
  opQtyRow: { flexDirection: 'row', gap: Spacing.md, paddingLeft: 2 },
  opQtyLabel: { fontSize: FontSize.xs },
  opMetaList: { gap: 2, paddingTop: 2 },
  opMetaText: { fontSize: FontSize.xs, lineHeight: 16 },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  reportBtnText: { fontSize: FontSize.xs, fontWeight: '700' },
  hintText: { fontSize: FontSize.xs, textAlign: 'center', paddingVertical: Spacing.xs },

  actions: { flexDirection: 'row', gap: Spacing.xs },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  secondaryBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
});
