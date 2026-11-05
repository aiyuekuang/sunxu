import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { ScanParseResult } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { WORK_ORDER_OP_STATUS, WORK_ORDER_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatNumber } from '../../../../core/utils/format';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScanOperationInfo = NonNullable<ScanParseResult['operation']> & {
  isOutsourced?: boolean;
};

type ScanOperationResult = Omit<ScanParseResult, 'operation'> & {
  operation?: ScanOperationInfo | null;
};

interface OperationResultCardProps {
  result: ScanOperationResult;
  canReportPermission: boolean;
  onReport: (operation: ScanOperationInfo) => void;
  onViewDetail: () => void;
  onClose: () => void;
}

function formatQty(value?: number | null): string {
  return formatNumber(value, { fallback: '0', maximumFractionDigits: 4 });
}

function formatToolingSessions(op: ScanOperationInfo): string | null {
  const sessions = op.runningToolingSessions ?? [];
  if (sessions.length === 0) return null;
  return sessions
    .map((session) => session.toolingCode ?? session.toolingName ?? session.toolingId)
    .filter(Boolean)
    .join('、');
}

// ─── Component ────────────────────────────────────────────────────────────────

export const OperationResultCard = React.memo(function OperationResultCard({
  result,
  canReportPermission,
  onReport,
  onViewDetail,
  onClose,
}: OperationResultCardProps) {
  const { colors } = useTheme();
  const { formatUnit } = useUnitDisplay('material');
  const wo = result.workOrder;
  const op = result.operation;

  if (!wo || !op) {
    return (
      <BottomSheet visible onClose={onClose} title="工序扫码" dynamicHeight>
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.productName, { color: colors.error }]}>工序信息缺失</Text>
            <Text style={[styles.opQtyLabel, { color: colors.textSecondary }]}>
              当前扫码结果未返回工序数据，请重新扫码或联系管理员检查二维码。
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
                继续扫码
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    );
  }

  const isOutsourced = op.isOutsourced === true;
  const canReport =
    canReportPermission && wo.status === 'in_progress' && op.isOutsourced === false && op.canReport;
  const reportDisabledReason = canReport
    ? null
    : isOutsourced
      ? '委外工序请通过委外单发料、收货和检验闭环，不能使用普通报工入口'
      : op.isOutsourced !== false
        ? '扫码结果未返回工序委外标识，请更新服务后重试'
        : !canReportPermission
          ? '当前账号没有报工权限，仅可查看工单详情'
          : wo.status !== 'in_progress'
            ? '工单未处于生产中，暂不可报工'
            : op.reportBlockReason;
  const toolingText = formatToolingSessions(op);

  return (
    <BottomSheet visible onClose={onClose} title="工序扫码" dynamicHeight>
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
        </View>

        {/* 工序信息 */}
        <View style={[styles.card, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={styles.cardHeader}>
            <View style={styles.opTitleRow}>
              <View style={[styles.seqBadge, { backgroundColor: `${colors.primary}20` }]}>
                <Text style={[styles.seqText, { color: colors.primary }]}>#{op.sequence}</Text>
              </View>
              <Text style={[styles.opName, { color: colors.text }]}>{op.operationName}</Text>
            </View>
            <Text
              style={[
                styles.statusText,
                { color: op.status === 'completed' ? colors.success : colors.warning },
              ]}
            >
              {WORK_ORDER_OP_STATUS[op.status]?.label ?? '未知状态'}
            </Text>
          </View>
          <View style={styles.opQtyRow}>
            <Text style={[styles.opQtyLabel, { color: colors.textSecondary }]}>
              已报工 {formatQty(op.reportedQty)} / {formatQty(op.effectiveQty)}
              {op.maxReportQty > 0 ? ` / 可报 ${formatQty(op.maxReportQty)}` : ''}{' '}
              {formatUnit(wo.materialUnit)}
            </Text>
            {op.scrappedQty > 0 && (
              <Text style={[styles.opQtyLabel, { color: colors.error }]}>
                报废 {formatQty(op.scrappedQty)}
              </Text>
            )}
          </View>
          <View style={styles.metaList}>
            {op.stageName || op.stageNo != null ? (
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                阶段 {op.stageName ?? `第 ${op.stageNo} 段`}
              </Text>
            ) : null}
            {op.dependencySummary ? (
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                前置 {op.dependencySummary}
              </Text>
            ) : null}
            {op.qualityBlockReason ? (
              <Text style={[styles.metaText, { color: colors.error }]}>
                {op.qualityBlockReason}
              </Text>
            ) : null}
            {toolingText ? (
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                工装 {toolingText}
              </Text>
            ) : null}
          </View>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.border }]}
            onPress={onViewDetail}
          >
            <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>工单详情</Text>
          </TouchableOpacity>
          {canReport ? (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.success }]}
              onPress={() => onReport(op)}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.textOnPrimary} />
              <Text style={[styles.primaryBtnText, { color: colors.textOnPrimary }]}>立即报工</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
                继续扫码
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {reportDisabledReason ? (
          <Text style={[styles.disabledHint, { color: colors.textMuted }]}>
            {reportDisabledReason}
          </Text>
        ) : null}
      </View>
    </BottomSheet>
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
  opTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flex: 1 },
  seqBadge: { paddingHorizontal: Spacing.xs, paddingVertical: 2, borderRadius: Radius.sm },
  seqText: { fontSize: FontSize.xs, fontWeight: '700' },
  opName: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  opQtyRow: { flexDirection: 'row', gap: Spacing.md, paddingLeft: 2 },
  opQtyLabel: { fontSize: FontSize.xs },
  metaList: { gap: 2, paddingTop: 2 },
  metaText: { fontSize: FontSize.xs, lineHeight: 16 },
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
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  primaryBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
  disabledHint: { fontSize: FontSize.xs, textAlign: 'center', marginTop: 2 },
});
