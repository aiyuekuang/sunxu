import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { type DimensionValue, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { WorkOrderOperation } from '../../../host/services';
import { OperationOutputMode } from '../../../types/models/OperationOutputMode';
import type { OperationPayPreviewDto } from '../../../types/models/OperationPayPreviewDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import {
  SCHEDULE_STATUS_CONFIG,
  TEMPORARY_OUTSOURCING_QUALITY_MODE_CONFIG,
  WORK_ORDER_OP_STATUS,
} from '../../../constants/status-configs';
import { FontSize, HIT_SLOP, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { isWorkOrderRevocable } from '../../../screen-support/work-orders/reporting-constraints';
import { getOperationReportUnit } from '../../../screen-support/work-orders/utils/operation-report-conversion';
import {
  formatScheduleSlotLabel,
  formatScheduleSlotSublabel,
} from '../../../screen-support/work-orders/utils/schedule-slot-display';
import { formatDuration, formatShortDateTime } from '../../../../core/utils/date';
import { formatNumber } from '../../../../core/utils/format';
import { formatUnitLabel } from '../../../utils/qty-unit';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OperationsTimelineProps {
  operations: WorkOrderOperation[];
  orderStatus: string;
  materialUnit: string;
  /** 权限控制：是否允许报工 */
  canReportPerm?: boolean;
  /** 权限控制：是否允许记录执行量/执行工时 */
  canRecordExecutionPerm?: boolean;
  /** 权限控制：是否允许冲正 */
  canRevokePerm?: boolean;
  /** 权限控制：是否允许作废执行记录 */
  canRevokeExecutionPerm?: boolean;
  /** 权限控制：是否允许编辑/更新 */
  canUpdatePerm?: boolean;
  /** 权限控制：是否允许查看排产 */
  canViewSchedulePerm?: boolean;
  onReport: (op: WorkOrderOperation) => void;
  onRevoke: (op: WorkOrderOperation) => void;
  onAssign: (op: WorkOrderOperation) => void;
  onEdit: (op: WorkOrderOperation) => void;
  onRemove: (op: WorkOrderOperation) => void;
  onAdd: () => void;
  onViewSchedule: (op: WorkOrderOperation) => void;
  onViewLogs: (op: WorkOrderOperation) => void;
}

interface ActionSheetOp {
  op: WorkOrderOperation;
  canReport: boolean;
  canManage: boolean;
  canRevoke: boolean;
  canAssign: boolean;
  canViewSchedule: boolean;
  hasLogs: boolean;
}

interface OperationScheduleSlot {
  id: string;
  plannedStart: string;
  plannedEnd: string;
  occupiedStartAt?: string | null;
  occupiedEndAt?: string | null;
  actualStartAt?: string | null;
  actualEndAt?: string | null;
  status: string;
  runtimeStatus?: string;
  reconfirmRequired?: boolean;
  equipmentName?: string | null;
}

type WorkOrderOperationWithScheduleSlots = WorkOrderOperation & {
  scheduleSlots?: OperationScheduleSlot[];
  setupMinutes?: number;
  setupSource?: 'standard' | 'actual' | 'default' | 'none' | null;
};

const SETUP_SOURCE_LABEL = {
  standard: '标准',
  actual: '实绩',
  default: '默认',
  none: '无',
} as const;

function getOperationScheduleSlots(op: WorkOrderOperation): OperationScheduleSlot[] {
  return ((op as WorkOrderOperationWithScheduleSlots).scheduleSlots ?? []).filter(
    (slot) => slot.status !== 'cancelled',
  );
}

function formatOutsourcedTiming(op: WorkOrderOperation): string {
  const setupTime = Number(op.setupTime ?? 0);
  const standardTime = Number(op.standardTime ?? 0);

  if (setupTime > 0 || standardTime > 0) {
    return `委外计划 准备 ${formatDuration(setupTime)} / 单件 ${formatDuration(standardTime)}`;
  }

  if (op.outsourcingLeadTimeMinutes != null && op.outsourcingLeadTimeMinutes > 0) {
    return `历史周期 ${formatDuration(op.outsourcingLeadTimeMinutes)}`;
  }

  return '委外加工';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatShortTime(dateStr: string | null): string {
  if (!dateStr) return '';
  return formatShortDateTime(dateStr);
}

function formatOperationTooling(op: WorkOrderOperation): string | null {
  const sessions = op.runningToolingSessions ?? [];
  if (sessions.length === 0) return null;
  return sessions
    .map((session) => session.toolingCode ?? session.toolingName ?? session.toolingId)
    .filter(Boolean)
    .join('、');
}

function isNonOutputOperation(op: WorkOrderOperation): boolean {
  return op.operationOutputMode === OperationOutputMode.NON_OUTPUT_EXECUTION;
}

function isExecutionQuantityOperation(op: WorkOrderOperation): boolean {
  return op.operationOutputMode === OperationOutputMode.EXECUTION_QUANTITY;
}

function isQualityBlocked(op: WorkOrderOperation): boolean {
  return Boolean(op.qualityBlockReason) || op.readyState === 'blocked_by_quality';
}

function isExecutionRecordOperation(op: WorkOrderOperation): boolean {
  return isNonOutputOperation(op) || isExecutionQuantityOperation(op);
}

function canRecordExecutionOperation(
  op: WorkOrderOperation,
  orderStatus: string,
  canRecordExecutionPerm: boolean,
): boolean {
  if (
    isQualityBlocked(op) ||
    op.isOutsourced === true ||
    !canRecordExecutionPerm ||
    !isExecutionRecordOperation(op) ||
    orderStatus !== 'in_progress'
  ) {
    return false;
  }
  if (op.status === 'skipped') return false;
  if (!['completed', 'skipped'].includes(op.status)) return true;

  const target = Number(op.executionQtyTarget ?? op.plannedQty ?? 0);
  const recorded = Number(op.executionQty ?? 0);
  return isExecutionQuantityOperation(op) && target - recorded > 0.0001;
}

function getPrimaryActionLabel(op: WorkOrderOperation): string {
  if (isExecutionQuantityOperation(op)) return '记录执行量';
  return isNonOutputOperation(op) ? '记录执行' : '报工';
}

function isOperationPayPreview(value: unknown): value is OperationPayPreviewDto {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.payMode === 'string' &&
    typeof record.priceConfigured === 'boolean' &&
    typeof record.visible === 'boolean'
  );
}

function formatPayPreviewText(payPreview: unknown): string | null {
  if (!isOperationPayPreview(payPreview) || payPreview.payMode === 'none') {
    return null;
  }
  if (!payPreview.priceConfigured) {
    return payPreview.message || '未配置工价';
  }
  if (!payPreview.visible) {
    return payPreview.message || '工价已配置';
  }
  const unitPrice =
    payPreview.unitPrice != null ? `¥${Number(payPreview.unitPrice).toFixed(4)}` : '—';
  const unitName = payPreview.unitName ? `/${payPreview.unitName}` : '';
  const amount =
    payPreview.estimatedAmount != null
      ? `，预计 ¥${Number(payPreview.estimatedAmount).toFixed(2)}`
      : '';
  return `${unitPrice}${unitName}${amount}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OperationsTimeline({
  operations,
  orderStatus,
  materialUnit,
  canReportPerm = true,
  canRecordExecutionPerm = true,
  canRevokePerm = false,
  canRevokeExecutionPerm = false,
  canUpdatePerm = true,
  canViewSchedulePerm = false,
  onReport,
  onRevoke,
  onAssign,
  onEdit,
  onRemove,
  onAdd,
  onViewSchedule,
  onViewLogs,
}: OperationsTimelineProps) {
  const { colors } = useTheme();
  const { labelMap: operationUnitLabelMap } = useUnitDisplay('operation');
  const [actionSheet, setActionSheet] = useState<ActionSheetOp | null>(null);

  const isTerminal = ['completed', 'cancelled', 'closed'].includes(orderStatus);
  const showSection = operations.length > 0 || !isTerminal;

  if (!showSection) return null;

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: 'checkmark' as const, bg: colors.success, fg: colors.textOnPrimary };
      case 'in_progress':
        return { icon: 'ellipse' as const, bg: colors.warning, fg: colors.textOnPrimary };
      case 'skipped':
        return { icon: 'remove' as const, bg: colors.textTertiary, fg: colors.textOnPrimary };
      default:
        return { icon: 'ellipse-outline' as const, bg: colors.border, fg: colors.textMuted };
    }
  };

  const handleRowPress = (op: WorkOrderOperation) => {
    const isOutsourced = op.isOutsourced === true;
    const reportedQty = Number(op.reportedQty ?? 0);
    const executionQty = Number(op.executionQty ?? 0);
    const isExecutionRecord = isExecutionRecordOperation(op);
    const canRecordExecution = canRecordExecutionOperation(op, orderStatus, canRecordExecutionPerm);
    const canReport = isExecutionRecord
      ? canRecordExecution
      : !isOutsourced &&
        !isQualityBlocked(op) &&
        canReportPerm &&
        orderStatus === 'in_progress' &&
        op.canReport === true;
    const canManage = !isOutsourced && canUpdatePerm && op.status === 'pending' && !isTerminal;
    const canRevoke =
      !isOutsourced &&
      (isExecutionRecord ? canRevokeExecutionPerm : canRevokePerm) &&
      (reportedQty > 0 || executionQty > 0 || Number(op.actualTime ?? 0) > 0) &&
      isWorkOrderRevocable(orderStatus);
    const canAssign = canReport;
    const scheduleSlots = getOperationScheduleSlots(op);
    const canViewSchedule = canViewSchedulePerm && scheduleSlots.length > 0;
    const hasLogs =
      reportedQty > 0 ||
      op.reportedAt != null ||
      Number(op.actualTime ?? 0) > 0 ||
      Number(op.executionQty ?? 0) > 0;
    if (!canReport && !canManage && !canRevoke && !canViewSchedule && !hasLogs) return;
    setActionSheet({
      op,
      canReport,
      canManage,
      canRevoke,
      canAssign,
      canViewSchedule,
      hasLogs,
    });
  };

  return (
    <>
      <DetailCard
        title="工序进度"
        noPadding
        right={
          !isTerminal && canUpdatePerm ? (
            <TouchableOpacity
              style={[styles.addOpBtn, { backgroundColor: colors.primarySurface }]}
              onPress={onAdd}
              hitSlop={HIT_SLOP}
            >
              <Ionicons name="add" size={14} color={colors.primary} />
              <Text style={[styles.addOpText, { color: colors.primary }]}>添加工序</Text>
            </TouchableOpacity>
          ) : undefined
        }
      >
        {operations.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              暂无工序，点击"添加工序"手工录入
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {operations.map((op, idx) => {
              const opCfg = WORK_ORDER_OP_STATUS[op.status] ?? {
                label: '未知状态',
                color: colors.textMuted,
              };
              const isOutsourced = op.isOutsourced === true;
              const step = getStepIcon(op.status);
              const isLast = idx === operations.length - 1;
              const isNonOutput = isNonOutputOperation(op);
              const isExecutionQuantity = isExecutionQuantityOperation(op);
              const showExecutionQtyProgress =
                isExecutionQuantity && op.executionQtyVisible !== false;
              const isExecutionRecord = isNonOutput || isExecutionQuantity;
              const canRecordExecution = canRecordExecutionOperation(
                op,
                orderStatus,
                canRecordExecutionPerm,
              );
              const canReport = isExecutionRecord
                ? canRecordExecution
                : !isOutsourced &&
                  !isQualityBlocked(op) &&
                  canReportPerm &&
                  orderStatus === 'in_progress' &&
                  op.canReport === true;
              const progressMetrics = {
                completedQty: Number(op.completedQty ?? 0),
                scrappedQty: Number(op.scrappedQty ?? 0),
                reportedQty: Number(op.reportedQty ?? 0),
                effectiveQty: Number(op.effectiveQty ?? 0),
                progress: Number(op.progress ?? 0),
              };
              const executionQty = Number(op.executionQty ?? 0);
              const executionQtyTarget = Number(op.executionQtyTarget ?? 0);
              const pct =
                showExecutionQtyProgress && executionQtyTarget > 0
                  ? Math.min(100, Math.round((executionQty / executionQtyTarget) * 100))
                  : progressMetrics.progress;

              // 元信息标签
              const metaTags: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [];
              if (op.createdAt) {
                metaTags.push({
                  icon: 'add-circle-outline',
                  text: `开单 ${formatShortTime(op.createdAt)}`,
                });
              }
              const reporterName = op.reporter?.realName ?? op.reporter?.username;
              const assigneeName = op.assignee?.realName ?? op.assignee?.username;
              if (reporterName) {
                metaTags.push({ icon: 'person-outline', text: reporterName });
              } else if (assigneeName) {
                metaTags.push({ icon: 'person-outline', text: assigneeName });
              }
              if (op.actualTime != null && op.actualTime > 0) {
                metaTags.push({ icon: 'time-outline', text: formatDuration(op.actualTime) });
              }
              const setupDetails = op as WorkOrderOperationWithScheduleSlots;
              if (setupDetails.setupSource) {
                const sourceLabel = SETUP_SOURCE_LABEL[setupDetails.setupSource];
                const setupMinutes = setupDetails.setupMinutes ?? Number(op.setupTime ?? 0);
                metaTags.push({
                  icon: 'time-outline',
                  text: `准备/换型 ${formatDuration(setupMinutes)} · ${sourceLabel}`,
                });
              }
              if (isOutsourced) {
                metaTags.push({
                  icon: 'business-outline',
                  text: formatOutsourcedTiming(op),
                });
                metaTags.push({
                  icon: op.outsourcingOutputMaterialId ? 'cube-outline' : 'alert-circle-outline',
                  text: op.outsourcingOutputMaterialId ? '委外交付物已配置' : '未配置委外交付物',
                });
              }
              if (!isOutsourced && op.allowTemporaryOutsourcingSnapshot) {
                const qualityMode = op.temporaryOutsourcingQualityModeSnapshot;
                const qualityLabel = qualityMode
                  ? (TEMPORARY_OUTSOURCING_QUALITY_MODE_CONFIG[qualityMode]?.label ??
                    '质量策略未配置')
                  : '质量策略未配置';
                metaTags.push({
                  icon: 'swap-horizontal-outline',
                  text: `允许临时委外 · ${qualityLabel}`,
                });
              }
              if (!isOutsourced && op.equipment?.name) {
                metaTags.push({ icon: 'construct-outline', text: op.equipment?.name });
              }
              if (op.stageName || op.stageNo != null) {
                metaTags.push({
                  icon: 'layers-outline',
                  text: op.stageName ?? `第 ${op.stageNo} 段`,
                });
              }
              if (op.dependencySummary) {
                metaTags.push({
                  icon: 'git-network-outline',
                  text: `前置 ${op.dependencySummary}`,
                });
              }
              const toolingText = formatOperationTooling(op);
              if (toolingText) {
                metaTags.push({ icon: 'hammer-outline', text: `工装 ${toolingText}` });
              }
              const payPreviewText = formatPayPreviewText(op.payPreview);
              if (payPreviewText) {
                metaTags.push({
                  icon: 'cash-outline',
                  text: payPreviewText,
                });
              }
              if (op.startTime) {
                const timeRange = op.endTime
                  ? `${formatShortTime(op.startTime)} ~ ${formatShortTime(op.endTime)}`
                  : `${formatShortTime(op.startTime)} 起`;
                metaTags.push({ icon: 'calendar-outline', text: timeRange });
              }
              if (op.reportedAt) {
                metaTags.push({
                  icon: 'document-text-outline',
                  text: `报工 ${formatShortTime(op.reportedAt)}`,
                });
              }
              if (op.auxiliaryPriceRatioSnapshot != null) {
                metaTags.push({
                  icon: 'people-outline',
                  text: `辅操比例 ${Math.round(Number(op.auxiliaryPriceRatioSnapshot) * 100)}%`,
                });
              }

              const isActive = op.status === 'in_progress';
              const scheduleSlots = getOperationScheduleSlots(op);
              const operationReportUnit = formatUnitLabel(
                getOperationReportUnit(op, materialUnit),
                operationUnitLabelMap,
              );
              const executionUnit =
                formatUnitLabel(op.executionUnit, operationUnitLabelMap) || '次';
              const operationReportTarget =
                op.operationReportTargetQtySnapshot ?? op.operationReportTargetQty;
              if (!isOutsourced && !isExecutionRecord && operationReportTarget != null) {
                metaTags.push({
                  icon: 'analytics-outline',
                  text: `工序 ${formatNumber(op.operationReportReportedQty, {
                    fallback: '0',
                    maximumFractionDigits: 4,
                  })}/${formatNumber(operationReportTarget, {
                    maximumFractionDigits: 4,
                  })} ${operationReportUnit}`,
                });
              }
              if (!isOutsourced && !isExecutionRecord && op.operationReportSummary) {
                metaTags.push({
                  icon: 'swap-horizontal-outline',
                  text: op.operationReportSummary,
                });
              }
              const qtyLabel = isOutsourced
                ? `委外收货 ${formatNumber(progressMetrics.completedQty, {
                    maximumFractionDigits: 4,
                  })}/${formatNumber(progressMetrics.effectiveQty, {
                    maximumFractionDigits: 4,
                  })} ${materialUnit}`
                : isExecutionQuantity
                  ? !showExecutionQtyProgress
                    ? '加工计数工序'
                    : executionQtyTarget > 0
                      ? `执行量 ${formatNumber(executionQty, { maximumFractionDigits: 4 })}/${formatNumber(
                          executionQtyTarget,
                          { maximumFractionDigits: 4 },
                        )} ${executionUnit}`
                      : `执行量 ${formatNumber(executionQty, { maximumFractionDigits: 4 })} ${executionUnit}`
                  : isNonOutput
                    ? op.actualTime != null && op.actualTime > 0
                      ? `工时 ${formatDuration(op.actualTime)}`
                      : '只记录执行'
                    : progressMetrics.scrappedQty > 0
                      ? `${formatNumber(progressMetrics.reportedQty, {
                          maximumFractionDigits: 4,
                        })}/${formatNumber(progressMetrics.effectiveQty, {
                          maximumFractionDigits: 4,
                        })} ${materialUnit}（良${formatNumber(progressMetrics.completedQty, {
                          maximumFractionDigits: 4,
                        })} 废${formatNumber(progressMetrics.scrappedQty, {
                          maximumFractionDigits: 4,
                        })}）`
                      : `${formatNumber(progressMetrics.reportedQty, {
                          maximumFractionDigits: 4,
                        })}/${formatNumber(progressMetrics.effectiveQty, {
                          maximumFractionDigits: 4,
                        })} ${materialUnit}`;

              return (
                <TouchableOpacity
                  key={op.id}
                  style={[
                    styles.timelineRow,
                    isActive && { backgroundColor: `${colors.warning}08`, borderRadius: Radius.sm },
                    op.qualityBlockReason && {
                      backgroundColor: `${colors.error}08`,
                      borderRadius: Radius.sm,
                    },
                  ]}
                  onPress={() => handleRowPress(op)}
                  activeOpacity={0.6}
                >
                  {/* Left: step indicator + connector line */}
                  <View style={styles.stepCol}>
                    <View style={[styles.stepDot, { backgroundColor: step.bg }]}>
                      <Ionicons
                        name={step.icon}
                        size={step.icon === 'ellipse' ? 10 : 14}
                        color={step.fg}
                      />
                    </View>
                    {!isLast && (
                      <View style={[styles.connector, { backgroundColor: colors.border }]} />
                    )}
                  </View>

                  {/* Right: content */}
                  <View style={[styles.contentCol, !isLast && { paddingBottom: Spacing.md }]}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.opName, { color: colors.text }]} numberOfLines={1}>
                        {op.operationName}
                      </Text>
                      {isOutsourced ? (
                        <Text style={[styles.outsourcedBadge, { color: colors.primary }]}>
                          委外
                        </Text>
                      ) : null}
                      <View style={styles.statusRow}>
                        {pct > 0 && (
                          <Text style={[styles.pctText, { color: opCfg.color }]}>
                            {Math.min(pct, 100)}%
                          </Text>
                        )}
                        <Text style={[styles.opStatus, { color: opCfg.color }]}>{opCfg.label}</Text>
                      </View>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.miniProgressRow}>
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
                      <Text style={[styles.qtyText, { color: colors.textSecondary }]}>
                        {qtyLabel}
                      </Text>
                    </View>

                    {/* Meta tags: reporter, time, equipment, date */}
                    {metaTags.length > 0 && (
                      <View style={styles.metaRow}>
                        {metaTags.map((tag) => (
                          <View key={tag.text} style={styles.metaTag}>
                            <Ionicons name={tag.icon} size={10} color={colors.textTertiary} />
                            <Text
                              style={[styles.metaText, { color: colors.textTertiary }]}
                              numberOfLines={1}
                            >
                              {tag.text}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {scheduleSlots.length > 0 && (
                      <View style={styles.scheduleRow}>
                        <Text style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                          排产计划
                        </Text>
                        <View style={styles.scheduleList}>
                          {scheduleSlots.map((slot) => {
                            const slotStatus = SCHEDULE_STATUS_CONFIG[slot.status] ?? {
                              label: '未知状态',
                              color: colors.textSecondary,
                              bg: `${colors.textMuted}15`,
                            };
                            const statusLabel = slot.reconfirmRequired
                              ? '待重确认'
                              : slotStatus.label;
                            const scheduleLabel = formatScheduleSlotLabel(slot);
                            const scheduleHint = formatScheduleSlotSublabel(slot);
                            return (
                              <View
                                key={slot.id}
                                style={[
                                  styles.scheduleTag,
                                  {
                                    backgroundColor: slotStatus.bg,
                                    borderColor: `${slotStatus.color}26`,
                                  },
                                ]}
                              >
                                <Ionicons
                                  name="calendar-clear-outline"
                                  size={10}
                                  color={slotStatus.color}
                                />
                                <Text style={[styles.scheduleText, { color: slotStatus.color }]}>
                                  {scheduleLabel}
                                  {scheduleHint ? `\n${scheduleHint}` : ''}
                                </Text>
                                <View
                                  style={[
                                    styles.scheduleStatusBadge,
                                    { backgroundColor: `${slotStatus.color}14` },
                                  ]}
                                >
                                  <Text
                                    style={[styles.scheduleStatusText, { color: slotStatus.color }]}
                                  >
                                    {statusLabel}
                                  </Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    )}

                    {op.qualityBlockReason || op.reportBlockReason ? (
                      <Text
                        style={[
                          styles.blockReason,
                          {
                            color: op.qualityBlockReason ? colors.error : colors.textSecondary,
                          },
                        ]}
                      >
                        {op.qualityBlockReason ?? op.reportBlockReason}
                      </Text>
                    ) : null}

                    {/* Report button */}
                    {canReport && (
                      <View style={styles.bottomRow}>
                        <View />
                        <TouchableOpacity
                          style={[
                            styles.reportBtn,
                            {
                              backgroundColor: `${colors.primary}12`,
                              borderColor: `${colors.primary}30`,
                            },
                          ]}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            onReport(op);
                          }}
                          hitSlop={HIT_SLOP}
                        >
                          <Ionicons name="create-outline" size={13} color={colors.primary} />
                          <Text style={[styles.reportBtnText, { color: colors.primary }]}>
                            {getPrimaryActionLabel(op)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </DetailCard>

      {/* Operation Action BottomSheet */}
      <BottomSheet
        visible={!!actionSheet}
        onClose={() => setActionSheet(null)}
        title={`操作：${actionSheet?.op.operationName ?? ''}`}
        dynamicHeight
      >
        <View style={styles.actionList}>
          {actionSheet?.canAssign && (
            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => {
                setActionSheet(null);
                onAssign(actionSheet.op);
              }}
            >
              <Ionicons name="person-add-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.text }]}>指派</Text>
              <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>分配操作员</Text>
            </TouchableOpacity>
          )}
          {actionSheet?.canRevoke && (
            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => {
                setActionSheet(null);
                onRevoke(actionSheet.op);
              }}
            >
              <Ionicons name="arrow-undo-outline" size={20} color={colors.warning} />
              <Text style={[styles.actionLabel, { color: colors.text }]}>冲正</Text>
              <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                {isExecutionRecordOperation(actionSheet.op) ? '作废执行记录' : '撤销已报工数量'}
              </Text>
            </TouchableOpacity>
          )}
          {actionSheet?.hasLogs && (
            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => {
                setActionSheet(null);
                onViewLogs(actionSheet.op);
              }}
            >
              <Ionicons name="list-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.text }]}>流水</Text>
              <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                查看报工/冲正记录
              </Text>
            </TouchableOpacity>
          )}
          {actionSheet?.canViewSchedule && (
            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => {
                setActionSheet(null);
                onViewSchedule(actionSheet.op);
              }}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.text }]}>查看排产</Text>
              <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                查看该工序的排产条目
              </Text>
            </TouchableOpacity>
          )}
          {actionSheet?.canManage && (
            <>
              <TouchableOpacity
                style={[styles.actionItem, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => {
                  setActionSheet(null);
                  onEdit(actionSheet.op);
                }}
              >
                <Ionicons name="pencil-outline" size={20} color={colors.primary} />
                <Text style={[styles.actionLabel, { color: colors.text }]}>编辑</Text>
                <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                  修改工序名称或顺序
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionItem, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => {
                  setActionSheet(null);
                  onRemove(actionSheet.op);
                }}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
                <Text style={[styles.actionLabel, { color: colors.error }]}>删除</Text>
                <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>移除此工序</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </BottomSheet>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  addOpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    gap: 2,
  },
  addOpText: { fontSize: FontSize.xs, fontWeight: '600' },
  empty: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, alignItems: 'center' },
  emptyText: { fontSize: FontSize.sm },
  timeline: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.xs },
  timelineRow: { flexDirection: 'row' },
  stepCol: { width: 28, alignItems: 'center' },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  connector: { width: 2, flex: 1, marginTop: -2, marginBottom: -2 },
  contentCol: { flex: 1, marginLeft: Spacing.sm, gap: Spacing.xs },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  opName: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  outsourcedBadge: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(59, 130, 246, 0.10)',
  },
  opStatus: { fontSize: FontSize.xs, fontWeight: '500' },
  miniProgressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  pctText: { fontSize: FontSize.xs, fontWeight: '700' },
  miniTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  miniFill: { height: 6, borderRadius: 3 },
  qtyText: { fontSize: FontSize.xs, textAlign: 'right', flexShrink: 0 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metaTag: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  metaText: { fontSize: FontSize.xs, maxWidth: 120 },
  blockReason: { fontSize: FontSize.xs, lineHeight: 16 },
  scheduleRow: { gap: 4 },
  scheduleLabel: { fontSize: FontSize.xs, fontWeight: '600' },
  scheduleList: { gap: 4 },
  scheduleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 3,
  },
  scheduleText: { fontSize: FontSize.xs, fontWeight: '500' },
  scheduleStatusBadge: {
    marginLeft: 'auto',
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  scheduleStatusText: { fontSize: FontSize.xs, fontWeight: '600' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  reportBtnText: { fontSize: FontSize.xs, fontWeight: '600' },
  actionList: { gap: Spacing.sm },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  actionLabel: { fontSize: FontSize.base, fontWeight: '600', width: 48 },
  actionDesc: { fontSize: FontSize.sm, flex: 1 },
});
