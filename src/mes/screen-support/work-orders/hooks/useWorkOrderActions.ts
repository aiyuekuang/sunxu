import { createElement, type ReactNode, useCallback, useState } from 'react';
import { Alert, type AlertButton } from 'react-native';
import {
  type ChildOrderSummary,
  materialIssueService,
  type ReportLogItem,
  type ScheduleEntry,
  scheduleService,
  type WorkOrder,
  type WorkOrderOperation,
  workOrderService,
} from '../../../host/services';
import { AppendWorkOrderQuantityDto } from '../../../host/api-types';
import type { BatchReportItemDto } from '../../../host/api-types';
import type { CheckMaterialReadinessDto } from '../../../host/api-types';
import { RecordOperationExecutionDto } from '../../../host/api-types';
import { ReportOperationDto } from '../../../host/api-types';
import { ScheduleRuntimeStatus } from '../../../host/api-types';
import { ScheduleStatus } from '../../../host/api-types';
import { WorkOrderPlanOverrunResolution } from '../../../host/api-types';
import { WorkOrderQuantityActionPreviewDto } from '../../../host/api-types';
import type { WorkOrderQuantityActionPreviewResponseDto } from '../../../host/api-types';
import type { WorkOrderQuantityActionResolutionDto } from '../../../host/api-types';
import type { WorkOrderReadinessOverrideDto } from '../../../host/api-types';
import {
  extractProductionReceiptSummary,
  type ProductionReceiptReportSummary,
} from '../../../host/services';
import { confirmAlert } from '../../../../core/components/ConfirmAlert';
import { messageAlert } from '../../../components/common/MessageAlert';
import { useActionRunner } from '../../../host/hooks/useActionRunner';
import type { ApprovalState } from '../../../host/hooks/useApprovalStatus';
import { ReadinessOverrideModal } from '../../../screens/work-orders/components/ReadinessOverrideModal';
import { ReportReceiptSummarySheet } from '../../../screens/work-orders/components/ReportReceiptSummarySheet';
import { StartScheduleEntrySheet } from '../../../screens/work-orders/components/StartScheduleEntrySheet';
import { getOperationReportConstraint } from '../reporting-constraints';
import { toISO } from '../../../../core/utils/date';
import { formatNumber } from '../../../../core/utils/format';
import { toast } from '../../../utils/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportExecutionPayload = Parameters<typeof workOrderService.recordOperationExecution>[0];
type ReportOperationPayload = Parameters<typeof workOrderService.reportOperation>[0];
type QuantityActionType = 'edit' | 'append' | 'supplement';
type QuantityActionPreviewResolution = WorkOrderPlanOverrunResolution | undefined;

const QUANTITY_ACTION_PREVIEW_CANCELLED = 'QUANTITY_ACTION_PREVIEW_CANCELLED';

function getToolingLifeWarningMessages(result: unknown): string[] {
  if (!result || typeof result !== 'object') return [];
  const warnings = (result as { toolingLifeWarnings?: unknown }).toolingLifeWarnings;
  if (!Array.isArray(warnings)) return [];
  return warnings.flatMap((warning) => {
    if (!warning || typeof warning !== 'object') return [];
    const message = (warning as { message?: unknown }).message;
    return typeof message === 'string' && message.trim() ? [message] : [];
  });
}

const PLAN_OVERRUN_MODE_LABEL: Record<string, string> = {
  warning: '提示留痕后允许继续',
  blocking: '超过计划先阻断',
  approval: '超过计划走审批',
  auto_adjust_plan: '确认调增计划后继续',
};

function toPreviewPlanOverrunResolution(
  resolution: QuantityActionPreviewResolution,
): WorkOrderQuantityActionPreviewDto.planOverrunResolution | undefined {
  switch (resolution) {
    case WorkOrderPlanOverrunResolution.ACCEPT_WARNING:
      return WorkOrderQuantityActionPreviewDto.planOverrunResolution.ACCEPT_WARNING;
    case WorkOrderPlanOverrunResolution.SUBMIT_OVERRUN_APPROVAL:
      return WorkOrderQuantityActionPreviewDto.planOverrunResolution.SUBMIT_OVERRUN_APPROVAL;
    case WorkOrderPlanOverrunResolution.ADJUST_PLAN_AND_APPEND:
      return WorkOrderQuantityActionPreviewDto.planOverrunResolution.ADJUST_PLAN_AND_APPEND;
    default:
      return undefined;
  }
}

function toAppendPlanOverrunResolution(
  resolution: QuantityActionPreviewResolution,
): AppendWorkOrderQuantityDto.planOverrunResolution | undefined {
  switch (resolution) {
    case WorkOrderPlanOverrunResolution.ACCEPT_WARNING:
      return AppendWorkOrderQuantityDto.planOverrunResolution.ACCEPT_WARNING;
    case WorkOrderPlanOverrunResolution.SUBMIT_OVERRUN_APPROVAL:
      return AppendWorkOrderQuantityDto.planOverrunResolution.SUBMIT_OVERRUN_APPROVAL;
    case WorkOrderPlanOverrunResolution.ADJUST_PLAN_AND_APPEND:
      return AppendWorkOrderQuantityDto.planOverrunResolution.ADJUST_PLAN_AND_APPEND;
    default:
      return undefined;
  }
}

export type ReportSubmitExtra = Partial<
  Pick<
    ReportExecutionPayload,
    | 'durationMinutes'
    | 'actualSetupMinutes'
    | 'equipmentSessionId'
    | 'startedAt'
    | 'endedAt'
    | 'workCenterId'
    | 'executionQty'
    | 'executionUnit'
  >
> &
  Pick<Partial<ReportExecutionPayload>, 'executionReason'> &
  Pick<
    Partial<ReportOperationPayload>,
    | 'zeroQuantityReason'
    | 'reportedOperationQty'
    | 'reportedOperationScrappedQty'
    | 'serialNumbers'
    | 'scrappedSerialNumbers'
    | 'receiptLocationId'
    | 'storageLocation'
    | 'abnormalDurationConfirmed'
    | 'abnormalDurationNote'
  > & {
    demandLineId?: string;
    isExecutionRecord?: boolean;
    isNonOutputExecution?: boolean;
    isExecutionQuantity?: boolean;
    timeSource?: ReportOperationDto.timeSource;
  };

function toExecutionTimeSource(
  source?: ReportOperationDto.timeSource,
): RecordOperationExecutionDto.timeSource | undefined {
  switch (source) {
    case ReportOperationDto.timeSource.MANUAL:
      return RecordOperationExecutionDto.timeSource.MANUAL;
    case ReportOperationDto.timeSource.SESSION:
      return RecordOperationExecutionDto.timeSource.SESSION;
    case ReportOperationDto.timeSource.IOT:
      return RecordOperationExecutionDto.timeSource.IOT;
    case ReportOperationDto.timeSource.DERIVED:
      return RecordOperationExecutionDto.timeSource.DERIVED;
    default:
      return undefined;
  }
}

function isExecutionReportLog(record: ReportLogItem): boolean {
  const outputQty = Number(record.completedQty ?? 0) + Number(record.scrappedQty ?? 0);
  return (
    record.quantityRole === 'execution' ||
    record.quantityRole === 'time' ||
    (outputQty === 0 &&
      (Number(record.executionQty ?? 0) > 0 || Number(record.durationMinutes ?? 0) > 0))
  );
}

function formatQty(value?: number | null): string {
  return Number(value ?? 0).toLocaleString('zh-CN', {
    maximumFractionDigits: 4,
  });
}

function buildQuantityActionPreviewMessage(
  preview: WorkOrderQuantityActionPreviewResponseDto,
): string {
  const lines = [
    `工单：${preview.orderNo}`,
    `动作前投产：${formatQty(preview.originalPlannedQty)}`,
    `动作后投产：${formatQty(preview.targetPlannedQty)}`,
    `本次数量：${formatQty(preview.deltaQty)}`,
  ];

  const planImpact = preview.planImpact;
  if (planImpact) {
    lines.push(
      '',
      `生产计划：${planImpact.planNo || planImpact.planId || '未关联计划号'}`,
      `超计划策略：${PLAN_OVERRUN_MODE_LABEL[planImpact.overrunMode] ?? planImpact.overrunMode}`,
      `计划投产：${formatQty(planImpact.planPlannedQty)}`,
      `本次后分配：${formatQty(planImpact.targetAllocatedQty)}`,
      `超出数量：${formatQty(planImpact.overrunQty)}`,
      planImpact.recommendedAction,
    );
  }

  if (preview.blockingReasons.length > 0) {
    lines.push('', `阻断原因：${preview.blockingReasons.join('；')}`);
  }
  if (preview.warnings.length > 0) {
    lines.push('', `提示：${preview.warnings.join('；')}`);
  }
  if (preview.willApply.length > 0) {
    lines.push('', `确认后会处理：${preview.willApply.join('；')}`);
  }
  if (preview.nextSteps.length > 0) {
    lines.push('', `后续建议：${preview.nextSteps.join('；')}`);
  }
  if (preview.skippedBecauseDisabled.length > 0) {
    lines.push('', `本次不会自动处理：${preview.skippedBecauseDisabled.join('；')}`);
  }

  return lines.join('\n');
}

function isQuantityActionPreviewCancelled(error: unknown): boolean {
  return error instanceof Error && error.message === QUANTITY_ACTION_PREVIEW_CANCELLED;
}

function waitForQuantityActionPreviewConfirm(
  preview: WorkOrderQuantityActionPreviewResponseDto,
): Promise<QuantityActionPreviewResolution> {
  const enabledResolutions =
    preview.planImpact?.availableResolutions.filter((item) => item.enabled) ?? [];
  const selectedResolution = preview.planImpact?.selectedResolution ?? enabledResolutions[0]?.code;
  const message = buildQuantityActionPreviewMessage(preview);

  if (!preview.canExecute && !selectedResolution) {
    messageAlert('数量动作预检未通过', message, '知道了');
    return Promise.reject(new Error(QUANTITY_ACTION_PREVIEW_CANCELLED));
  }

  return new Promise((resolve, reject) => {
    const rejectCancel = () => reject(new Error(QUANTITY_ACTION_PREVIEW_CANCELLED));
    const resolutionButtons: AlertButton[] =
      enabledResolutions.length > 0
        ? enabledResolutions.map((item: WorkOrderQuantityActionResolutionDto) => ({
            text: item.label,
            onPress: () => resolve(item.code),
          }))
        : [
            {
              text: '确认提交',
              onPress: () => resolve(selectedResolution),
            },
          ];
    const buttons: AlertButton[] =
      resolutionButtons.length >= 3
        ? resolutionButtons
        : [{ text: '取消', style: 'cancel', onPress: rejectCancel }, ...resolutionButtons];

    Alert.alert('数量动作预检', message, buttons, {
      cancelable: true,
      onDismiss: rejectCancel,
    });
  });
}

interface UseWorkOrderActionsParams {
  id: string;
  orderNo: string;
  planId?: string | null;
  status: string;
  scheduleSlots?: Array<{ id: string }>;
  /** 良品数量（用于完工确认流程判断） */
  completedQty: number;
  /** 报废数量（与 completedQty 一起组成实际报工数量） */
  scrappedQty: number;
  /** 计划数量（用于完工确认提示文案） */
  plannedQty: number;
  /** 产品单位（用于完工确认提示文案） */
  unit: string;
  /** 工序列表（用于判断是否有未完成工序） */
  operations: WorkOrderOperation[];
  /** 当前已存在的子工单，用于反馈按需展开本次实际新增数量 */
  childOrders: ChildOrderSummary[];
  /** 下达动作后端预检 warning 文案 */
  releaseWarningText?: string;
  /** 下达齐套检查范围，来自后端 actions.release */
  releaseReadinessScope?: CheckMaterialReadinessDto['scope'];
  /** 下达齐套门禁模式，来自后端 actions.release */
  releaseReadinessGateMode?: 'warning' | 'blocking' | 'supervisor_override';
  /** 下达缺料时是否需要主管确认放行，来自后端 actions.release */
  releaseRequiresReadinessOverride?: boolean;
  /** 下达主管放行时是否必须填写原因，来自后端 actions.release */
  releaseReadinessOverrideReasonRequired?: boolean;
  /** 开工齐套检查范围，来自后端 actions.start */
  readinessScope?: CheckMaterialReadinessDto['scope'];
  /** 开工齐套门禁模式，来自后端 actions.start */
  readinessGateMode?: 'warning' | 'blocking' | 'supervisor_override';
  /** 缺料时是否需要主管确认放行，来自后端 actions.start */
  startRequiresReadinessOverride?: boolean;
  /** 主管放行时是否必须填写原因，来自后端 actions.start */
  readinessOverrideReasonRequired?: boolean;
  approval: ApprovalState;
  reload: () => Promise<void>;
  onNavigateToChild: (childId: string) => void;
  onReplaceWithOrder: (orderId: string) => void;
  onGoBack: () => void;
}

interface BatchReportInput {
  operationId: string;
  scheduleEntryId?: string;
  equipmentId?: string;
  occurredAt: string;
  completedQty: number;
  scrappedQty: number;
  reportedOperationQty?: number;
  reportedOperationScrappedQty?: number;
  remark: string;
  isAuxiliary?: boolean;
  scrapReason?: string;
  scrapPhotoUrls?: string[];
  photoUrls?: string[];
  demandLineId?: string;
}

interface ReadinessOverridePrompt {
  title: string;
  message: string;
  confirmText: string;
  reasonRequired: boolean;
  onSubmit: (reason: string) => void;
}

interface StartScheduleEntryPrompt {
  entries: ScheduleEntry[];
  readinessOverride?: WorkOrderReadinessOverrideDto;
}

function isStartScheduleEntry(entry: ScheduleEntry, firstPendingOperationId?: string): boolean {
  return (
    entry.isBuffer !== true &&
    (entry.status === ScheduleStatus.SCHEDULED || entry.status === ScheduleStatus.CONFIRMED) &&
    entry.runtimeStatus === ScheduleRuntimeStatus.PENDING &&
    entry.actualStartAt == null &&
    entry.actualEndAt == null &&
    (entry.operationId == null || entry.operationId === firstPendingOperationId)
  );
}

interface WorkOrderActions {
  actionLoading: boolean;
  readinessOverrideModal: ReactNode;
  startScheduleEntrySheet: ReactNode;
  /** pending_confirmation 模式下报工成功后的入库摘要弹窗（无摘要时不渲染任何内容） */
  reportReceiptSummarySheet: ReactNode;
  handleSubmitApproval: () => void;
  handleRelease: (receiptWarehouseId?: string) => void;
  handleStart: () => void;
  handlePause: () => void;
  handleResume: () => void;
  handleComplete: () => void;
  handleReopen: (reason: string) => void;
  handleClose: () => void;
  handleDelete: () => void;
  handleCancel: (reason: string) => void;
  handleCopy: () => void;
  handleCreateSubAssembly: () => void;
  handleSplitSubmit: (splitQty: number, description: string) => Promise<void>;
  handleQuantityActionSubmit: (
    actionType: QuantityActionType,
    quantity: number,
    reason: string,
  ) => Promise<void>;
  handleReportSubmit: (
    completedQty: number,
    scrappedQty: number,
    remark: string,
    operationId?: string,
    scheduleEntryId?: string,
    batchNo?: string,
    equipmentId?: string,
    reporterId?: string,
    isAuxiliary?: boolean,
    overrideReceiptWarehouseId?: string,
    receiptWarehouseChangeReason?: string,
    occurredAt?: string,
    scrapReason?: string,
    scrapPhotoUrls?: string[],
    photoUrls?: string[],
    extra?: ReportSubmitExtra,
  ) => Promise<void>;
  handleBatchReportSubmit: (items: BatchReportInput[], reporterId?: string) => Promise<void>;
  handleRevokeSubmit: (
    revokeCompletedQty: number,
    revokeScrapQty: number,
    remark: string,
    operationId: string,
  ) => Promise<void>;
  handleRevokeReportLog: (record: ReportLogItem) => Promise<void>;
  handleAssignSubmit: (assigneeId: string, operationId: string) => Promise<void>;
  handleRemoveOperation: (op: WorkOrderOperation) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkOrderActions({
  id,
  orderNo,
  status,
  planId,
  completedQty,
  scrappedQty,
  plannedQty,
  unit,
  operations,
  childOrders,
  releaseWarningText,
  releaseReadinessScope,
  releaseReadinessGateMode,
  releaseRequiresReadinessOverride,
  releaseReadinessOverrideReasonRequired = true,
  readinessScope,
  readinessGateMode,
  startRequiresReadinessOverride,
  readinessOverrideReasonRequired = true,
  approval,
  reload,
  onNavigateToChild,
  onReplaceWithOrder,
  onGoBack,
}: UseWorkOrderActionsParams): WorkOrderActions {
  const [actionLoading, setActionLoading] = useState(false);
  const [readinessOverridePrompt, setReadinessOverridePrompt] =
    useState<ReadinessOverridePrompt | null>(null);
  const [startScheduleEntryPrompt, setStartScheduleEntryPrompt] =
    useState<StartScheduleEntryPrompt | null>(null);
  const [reportReceiptSummary, setReportReceiptSummary] =
    useState<ProductionReceiptReportSummary | null>(null);
  const { run } = useActionRunner();

  const runAction = useCallback(
    async (action: () => Promise<unknown>, successMsg: string | ((result: unknown) => string)) => {
      setActionLoading(true);
      try {
        const result = await action();
        toast.success(typeof successMsg === 'function' ? successMsg(result) : successMsg);
        await reload();
      } catch (e: unknown) {
        const err = e as Error & { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || err.message || '工单操作失败');
      } finally {
        setActionLoading(false);
      }
    },
    [reload],
  );

  const handleReadinessOverrideSubmit = useCallback(
    (reason: string) => {
      const submit = readinessOverridePrompt?.onSubmit;
      setReadinessOverridePrompt(null);
      submit?.(reason);
    },
    [readinessOverridePrompt],
  );

  const handleSubmitApproval = useCallback(
    () =>
      confirmAlert(
        '提交审批',
        '提交后工单将进入审批流程，审批通过后系统会尝试自动下达；若未自动下达，可手动下达。',
        () =>
          runAction(async () => {
            await workOrderService.submit(id);
            await approval.reload();
          }, '已提交审批'),
        '提交',
        false,
      ),
    [id, runAction, approval.reload],
  );

  const handleRelease = useCallback(
    (receiptWarehouseId?: string) => {
      const submitRelease = (readinessOverride?: WorkOrderReadinessOverrideDto) =>
        runAction(
          () => workOrderService.release(id, undefined, receiptWarehouseId, readinessOverride),
          '已下达',
        );

      const confirmRelease = (readinessOverride?: WorkOrderReadinessOverrideDto) =>
        confirmAlert(
          '下达确认',
          `下达后将自动生成工序任务，是否继续？${
            releaseWarningText ? `\n\n${releaseWarningText}` : ''
          }`,
          () => submitRelease(readinessOverride),
          '下达',
          false,
        );

      if (!releaseReadinessScope) {
        confirmRelease();
        return;
      }

      void materialIssueService
        .checkReadiness(id, releaseReadinessScope)
        .then((readiness) => {
          const shortageReasons =
            readiness.blockingReasons && readiness.blockingReasons.length > 0
              ? readiness.blockingReasons
              : (readiness.items
                  ?.filter((item) => item.readyStatus !== 'ready')
                  .slice(0, 5)
                  .map((item) => {
                    const shortageQty = Math.max(
                      0,
                      Number(item.netRequired ?? 0) - Number(item.available ?? 0),
                    );
                    return `${item.materialCode || item.materialName} 缺口 ${formatNumber(
                      shortageQty,
                      { fallback: '0', maximumFractionDigits: 4 },
                    )}`;
                  }) ?? []);

          if (readiness.ready) {
            confirmRelease();
            return;
          }

          if (releaseReadinessGateMode === 'blocking') {
            toast.error(
              `物料未齐套，不能下达：${[readiness.message, ...shortageReasons]
                .filter(Boolean)
                .join('；')}`,
            );
            return;
          }

          if (releaseRequiresReadinessOverride) {
            const message = [readiness.message, ...shortageReasons, '确认后将按主管放行下达。']
              .filter(Boolean)
              .join('\n');
            if (releaseReadinessOverrideReasonRequired) {
              setReadinessOverridePrompt({
                title: '缺料下达放行',
                message,
                confirmText: '确认放行并下达',
                reasonRequired: true,
                onSubmit: (reason) => submitRelease({ accepted: true, reason }),
              });
              return;
            }
            confirmAlert(
              '缺料下达放行',
              message,
              () => submitRelease({ accepted: true }),
              '确认放行并下达',
              false,
            );
            return;
          }

          confirmAlert(
            '齐套检查未通过',
            [
              readiness.message,
              ...shortageReasons,
              '继续提交后，系统会按当前工厂策略决定是否允许下达。',
            ]
              .filter(Boolean)
              .join('\n'),
            () => submitRelease(),
            '继续下达',
            false,
          );
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : '齐套检查失败';
          if (releaseRequiresReadinessOverride) {
            const overrideMessage = ['齐套检查无法完成', message, '确认后将按主管放行下达。']
              .filter(Boolean)
              .join('\n');
            if (releaseReadinessOverrideReasonRequired) {
              setReadinessOverridePrompt({
                title: '齐套检查未完成',
                message: overrideMessage,
                confirmText: '确认放行并下达',
                reasonRequired: true,
                onSubmit: (reason) => submitRelease({ accepted: true, reason }),
              });
              return;
            }
            confirmAlert(
              '齐套检查未完成',
              overrideMessage,
              () => submitRelease({ accepted: true }),
              '确认放行并下达',
              false,
            );
            return;
          }
          confirmAlert(
            '齐套检查未完成',
            ['齐套检查无法完成', message, '继续提交后，系统会按当前工厂策略决定是否允许下达。']
              .filter(Boolean)
              .join('\n'),
            () => submitRelease(),
            '继续下达',
            false,
          );
        });
    },
    [
      id,
      releaseReadinessOverrideReasonRequired,
      releaseReadinessGateMode,
      releaseReadinessScope,
      releaseRequiresReadinessOverride,
      releaseWarningText,
      runAction,
    ],
  );

  const executeStart = useCallback(
    async (scheduleEntryId?: string, readinessOverride?: WorkOrderReadinessOverrideDto) => {
      await workOrderService.start(id, readinessOverride, scheduleEntryId);
      toast.success('已开工');
      await reload();
    },
    [id, reload],
  );

  const resolveStartScheduleEntry = useCallback(
    async (readinessOverride?: WorkOrderReadinessOverrideDto) => {
      setActionLoading(true);
      try {
        const entries = await scheduleService.listEntries({
          workOrderId: id,
          page: 1,
          pageSize: 100,
        });
        const firstPendingOperationId = operations.find(
          (operation) => operation.status === 'pending',
        )?.id;
        const startEntries = entries.list.filter((entry) =>
          isStartScheduleEntry(entry, firstPendingOperationId),
        );
        if (startEntries.length > 1) {
          setStartScheduleEntryPrompt({ entries: startEntries, readinessOverride });
          return;
        }
        await executeStart(startEntries[0]?.id, readinessOverride);
      } catch (error: unknown) {
        const err = error as Error & { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || err.message || '工单开工失败');
      } finally {
        setActionLoading(false);
      }
    },
    [executeStart, id, operations],
  );

  const handleStartScheduleEntrySubmit = useCallback(
    async (scheduleEntryId: string) => {
      const prompt = startScheduleEntryPrompt;
      if (!prompt) return;
      setActionLoading(true);
      try {
        await executeStart(scheduleEntryId, prompt.readinessOverride);
        setStartScheduleEntryPrompt(null);
      } catch (error: unknown) {
        const err = error as Error & { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || err.message || '工单开工失败');
      } finally {
        setActionLoading(false);
      }
    },
    [executeStart, startScheduleEntryPrompt],
  );

  const handleStart = useCallback(() => {
    const submitStart = (readinessOverride?: WorkOrderReadinessOverrideDto) => {
      void resolveStartScheduleEntry(readinessOverride);
    };

    if (!readinessScope) {
      confirmAlert('开工确认', '确定要开始此工单吗？', submitStart, '开工', false);
      return;
    }

    void materialIssueService
      .checkReadiness(id, readinessScope)
      .then((readiness) => {
        const shortageReasons =
          readiness.blockingReasons && readiness.blockingReasons.length > 0
            ? readiness.blockingReasons
            : (readiness.items
                ?.filter((item) => item.readyStatus !== 'ready')
                .slice(0, 5)
                .map((item) => {
                  const shortageQty = Math.max(
                    0,
                    Number(item.netRequired ?? 0) - Number(item.available ?? 0),
                  );
                  return `${item.materialCode || item.materialName} 缺口 ${formatNumber(
                    shortageQty,
                    { fallback: '0', maximumFractionDigits: 4 },
                  )}`;
                }) ?? []);

        if (readiness.ready) {
          confirmAlert('开工确认', '确定要开始此工单吗？', submitStart, '开工', false);
          return;
        }

        if (readinessGateMode === 'blocking') {
          toast.error(
            `物料未齐套，不能开工：${[readiness.message, ...shortageReasons]
              .filter(Boolean)
              .join('；')}`,
          );
          return;
        }

        if (startRequiresReadinessOverride) {
          const message = [readiness.message, ...shortageReasons, '确认后将按主管放行开工。']
            .filter(Boolean)
            .join('\n');
          if (readinessOverrideReasonRequired) {
            setReadinessOverridePrompt({
              title: '缺料开工放行',
              message,
              confirmText: '确认放行并开工',
              reasonRequired: true,
              onSubmit: (reason) => submitStart({ accepted: true, reason }),
            });
            return;
          }
          confirmAlert(
            '缺料开工放行',
            message,
            () => submitStart({ accepted: true }),
            '确认放行并开工',
            false,
          );
          return;
        }

        confirmAlert(
          '齐套检查未通过',
          [
            readiness.message,
            ...shortageReasons,
            '继续提交后，系统会按当前工厂策略决定是否允许开工。',
          ]
            .filter(Boolean)
            .join('\n'),
          submitStart,
          '继续开工',
          false,
        );
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : '齐套检查失败';
        if (startRequiresReadinessOverride) {
          const overrideMessage = ['齐套检查无法完成', message, '确认后将按主管放行开工。']
            .filter(Boolean)
            .join('\n');
          if (readinessOverrideReasonRequired) {
            setReadinessOverridePrompt({
              title: '齐套检查未完成',
              message: overrideMessage,
              confirmText: '确认放行并开工',
              reasonRequired: true,
              onSubmit: (reason) => submitStart({ accepted: true, reason }),
            });
            return;
          }
          confirmAlert(
            '齐套检查未完成',
            overrideMessage,
            () => submitStart({ accepted: true }),
            '确认放行并开工',
            false,
          );
          return;
        }
        confirmAlert(
          '齐套检查未完成',
          ['齐套检查无法完成', message, '继续提交后，系统会按当前工厂策略决定是否允许开工。']
            .filter(Boolean)
            .join('\n'),
          submitStart,
          '继续开工',
          false,
        );
      });
  }, [
    id,
    readinessOverrideReasonRequired,
    readinessGateMode,
    readinessScope,
    resolveStartScheduleEntry,
    startRequiresReadinessOverride,
  ]);

  const handlePause = useCallback(
    () =>
      confirmAlert(
        '暂停确认',
        '确定要暂停此工单吗？',
        () => runAction(() => workOrderService.pause(id), '已暂停'),
        '暂停',
      ),
    [id, runAction],
  );

  const handleResume = useCallback(
    () => runAction(() => workOrderService.resume(id), '已恢复'),
    [id, runAction],
  );

  const handleComplete = useCallback(() => {
    const unfinishedOps = operations.filter(
      (op) => op.status === 'pending' || op.status === 'in_progress',
    );
    const blockingUnfinishedOps = unfinishedOps.filter(
      (op) => getOperationReportConstraint(operations, op).maxQty > 0,
    );
    const operationReportedQty = operations.reduce(
      (sum, op) => sum + Number(op.completedQty ?? 0) + Number(op.scrappedQty ?? 0),
      0,
    );
    const reportedQty = completedQty + scrappedQty;
    const effectiveReportedQty = reportedQty > 0 ? reportedQty : operationReportedQty;
    const hasOutput = effectiveReportedQty > 0;
    const hasUnfinished = blockingUnfinishedOps.length > 0;

    if (!hasOutput) {
      // 零报工 → 强警告
      const opsHint = operations.length > 0 ? '，未完成的工序将被标记为「已跳过」' : '';
      confirmAlert(
        '强制完工',
        `该工单尚无报工数量（0/${formatNumber(plannedQty, {
          maximumFractionDigits: 4,
        })} ${unit}）${opsHint}。\n\n确定强制完工？`,
        () => runAction(() => workOrderService.complete(id, true), '已完工'),
        '强制完工',
        true,
      );
    } else if (hasUnfinished) {
      // 有产出但有未完成工序 → 警告
      const names = blockingUnfinishedOps
        .map((o) => `[${o.sequence}] ${o.operationName}`)
        .join('、');
      confirmAlert(
        '完工确认',
        `以下工序尚未完成：${names}。\n\n未完成的工序将被标记为「已跳过」，确定继续完工？`,
        () => runAction(() => workOrderService.complete(id, true), '已完工'),
        '继续完工',
        false,
      );
    } else {
      // 正常完工
      confirmAlert(
        '完工确认',
        '确定要完工此工单吗？',
        () => runAction(() => workOrderService.complete(id), '已完工'),
        '完工',
        false,
      );
    }
  }, [id, completedQty, scrappedQty, plannedQty, unit, operations, runAction]);

  const handleClose = useCallback(
    () =>
      confirmAlert(
        '结案确认',
        '结案后工单将完全锁定，不可再进行任何操作，是否继续？',
        () => runAction(() => workOrderService.close(id), '已结案'),
        '结案',
        false,
      ),
    [id, runAction],
  );

  const handleReopen = useCallback(
    (reason: string) => runAction(() => workOrderService.reopen(id, reason), '工单已撤销完工'),
    [id, runAction],
  );

  const handleDelete = useCallback(
    () =>
      confirmAlert(
        '删除工单',
        `确认删除工单「${orderNo}」？删除后不可恢复。`,
        () => run(() => workOrderService.delete(id), '工单已删除', onGoBack),
        '删除',
        true,
      ),
    [id, orderNo, onGoBack, run],
  );

  const handleCancel = useCallback(
    (reason: string) => runAction(() => workOrderService.cancel(id, reason), '工单已取消'),
    [id, runAction],
  );

  const handleCopy = useCallback(() => {
    const isCancelled = status === 'cancelled';
    confirmAlert(
      isCancelled ? '重新创建' : '复制工单',
      isCancelled
        ? '将基于此工单的配置重新创建一份草稿工单，关联同一生产计划。创建后可按需手动提交审批。'
        : '将基于当前工单的配置创建一份新的草稿工单。创建后可按需手动提交审批。',
      () =>
        run(
          async () => {
            const newOrder = await workOrderService.copy({
              sourceId: id,
              planId: planId ?? undefined,
            });
            onReplaceWithOrder(newOrder.id);
          },
          isCancelled ? '草稿工单已重新创建' : '草稿工单已创建',
        ),
      isCancelled ? '确认创建' : '复制',
      false,
    );
  }, [id, status, planId, onReplaceWithOrder, run]);

  const handleCreateSubAssembly = useCallback(() => {
    const previousChildOrderIds = new Set(childOrders.map((child) => child.id));
    confirmAlert(
      '按需创建子工单',
      '系统将按当前工单冻结的 BOM 和供给缺口补建半成品子工单；已有库存优先使用，已有子工单不会重复创建。',
      () =>
        runAction(
          async () => {
            const updated = await workOrderService.createSubAssemblyOrders({ id });
            const createdCount = (updated.childOrders ?? []).filter(
              (child) => !previousChildOrderIds.has(child.id),
            ).length;
            return { createdCount };
          },
          (result) => {
            if (
              result &&
              typeof result === 'object' &&
              'createdCount' in result &&
              typeof result.createdCount === 'number' &&
              result.createdCount > 0
            ) {
              return `已新增 ${result.createdCount} 张缺口子工单`;
            }
            return '供给已满足，未新增子工单';
          },
        ),
      '确认创建',
      false,
    );
  }, [childOrders, id, runAction]);

  const handleSplitSubmit = useCallback(
    async (splitQty: number, description: string) => {
      try {
        setActionLoading(true);
        const result = await workOrderService.split({
          id,
          splitQty,
          description: description || undefined,
        });
        toast.success('拆分成功');
        await reload();
        const splitResult = result as WorkOrder & { child?: { id: string } };
        const childId = splitResult?.child?.id ?? splitResult?.id;
        if (childId) {
          onNavigateToChild(childId);
        }
      } catch (e: unknown) {
        toast.error((e as Error).message);
      } finally {
        setActionLoading(false);
      }
    },
    [id, reload, onNavigateToChild],
  );

  const handleQuantityActionSubmit = useCallback(
    async (actionType: QuantityActionType, quantity: number, reason: string) => {
      try {
        setActionLoading(true);
        const reasonText = reason.trim();
        const buildPreviewPayload = (
          resolution?: WorkOrderPlanOverrunResolution,
        ): WorkOrderQuantityActionPreviewDto => ({
          id,
          actionType:
            actionType === 'edit'
              ? WorkOrderQuantityActionPreviewDto.actionType.EDIT
              : actionType === 'append'
                ? WorkOrderQuantityActionPreviewDto.actionType.APPEND
                : WorkOrderQuantityActionPreviewDto.actionType.SUPPLEMENT,
          targetPlannedQty: actionType === 'edit' ? quantity : undefined,
          deltaQty: actionType === 'edit' ? undefined : quantity,
          reason: reasonText || undefined,
          planOverrunResolution: toPreviewPlanOverrunResolution(resolution),
        });
        const preview = await workOrderService.quantityActionPreview(buildPreviewPayload());
        if (preview.requiredInputs.includes('reason') && !reasonText) {
          toast.info('当前公司策略要求填写原因');
          throw new Error(QUANTITY_ACTION_PREVIEW_CANCELLED);
        }
        const shouldConfirmPreview =
          !preview.canExecute ||
          preview.warnings.length > 0 ||
          preview.planImpact?.overrun === true;
        const selectedResolution = shouldConfirmPreview
          ? await waitForQuantityActionPreviewConfirm(preview)
          : preview.planImpact?.selectedResolution;
        const confirmedPreview = await workOrderService.quantityActionPreview(
          buildPreviewPayload(selectedResolution),
        );
        if (!confirmedPreview.canExecute) {
          messageAlert(
            '数量动作预检未通过',
            buildQuantityActionPreviewMessage(confirmedPreview),
            '知道了',
          );
          throw new Error(QUANTITY_ACTION_PREVIEW_CANCELLED);
        }
        const result =
          actionType === 'edit'
            ? await workOrderService.changeQuantity(buildPreviewPayload(selectedResolution))
            : actionType === 'append'
              ? await workOrderService.appendQuantity({
                  id,
                  deltaQty: quantity,
                  reason: reasonText || undefined,
                  planOverrunResolution: toAppendPlanOverrunResolution(selectedResolution),
                })
              : await workOrderService.supplementWorkOrder({
                  id,
                  deltaQty: quantity,
                  reason: reasonText || undefined,
                });

        if (result.preview?.warnings?.length) {
          toast.info(result.preview.warnings.join('；'));
        }
        toast.success(
          result.message || (result.executed ? '数量动作已生效' : '数量动作已提交审批'),
        );
        await reload();
        if (actionType === 'supplement' && result.executed && result.supplementWorkOrder?.id) {
          onNavigateToChild(result.supplementWorkOrder.id);
        }
      } catch (e: unknown) {
        if (isQuantityActionPreviewCancelled(e)) {
          throw e;
        }
        const err = e as Error & { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || err.message || '数量动作提交失败');
        throw e;
      } finally {
        setActionLoading(false);
      }
    },
    [id, reload, onNavigateToChild],
  );

  const handleReportSubmit = useCallback(
    async (
      completedQty: number,
      scrappedQty: number,
      remark: string,
      operationId?: string,
      scheduleEntryId?: string,
      batchNo?: string,
      equipmentId?: string,
      reporterId?: string,
      isAuxiliary?: boolean,
      overrideReceiptWarehouseId?: string,
      receiptWarehouseChangeReason?: string,
      occurredAt?: string,
      scrapReason?: string,
      scrapPhotoUrls?: string[],
      photoUrls?: string[],
      extra?: ReportSubmitExtra,
    ) => {
      setActionLoading(true);
      try {
        let reportResult: Awaited<ReturnType<typeof workOrderService.reportDirect>>;
        if (operationId && extra?.isExecutionRecord) {
          await workOrderService.recordOperationExecution({
            workOrderId: id,
            operationId,
            scheduleEntryId,
            equipmentId,
            reporterId,
            occurredAt: occurredAt ? toISO(occurredAt) : undefined,
            durationMinutes: extra.durationMinutes,
            actualSetupMinutes: extra.actualSetupMinutes,
            equipmentSessionId: extra.equipmentSessionId,
            startedAt: extra.startedAt ? toISO(extra.startedAt) : undefined,
            endedAt: extra.endedAt ? toISO(extra.endedAt) : undefined,
            timeSource: toExecutionTimeSource(extra.timeSource),
            workCenterId: extra.workCenterId,
            executionReason: extra.executionReason,
            executionQty: extra.executionQty,
            executionUnit: extra.executionUnit,
            remark: remark || undefined,
          });
          toast.success(extra.isExecutionQuantity ? '执行量已记录' : '执行记录已保存');
          await reload();
          return;
        }
        if (operationId) {
          const payload: Parameters<typeof workOrderService.reportOperation>[0] & {
            scheduleEntryId?: string;
          } = {
            workOrderId: id,
            operationId,
            scheduleEntryId,
            occurredAt: occurredAt ? toISO(occurredAt) : undefined,
            completedQty,
            scrappedQty,
            remark: remark || undefined,
            equipmentId,
            batchNo: batchNo || undefined,
            reporterId,
            isAuxiliary,
            scrapReason,
            scrapPhotoUrls,
            photoUrls,
            durationMinutes: extra?.durationMinutes,
            actualSetupMinutes: extra?.actualSetupMinutes,
            equipmentSessionId: extra?.equipmentSessionId,
            startedAt: extra?.startedAt ? toISO(extra.startedAt) : undefined,
            endedAt: extra?.endedAt ? toISO(extra.endedAt) : undefined,
            timeSource: extra?.timeSource,
            abnormalDurationConfirmed: extra?.abnormalDurationConfirmed,
            abnormalDurationNote: extra?.abnormalDurationNote,
            zeroQuantityReason: extra?.zeroQuantityReason,
            reportedOperationQty: extra?.reportedOperationQty,
            reportedOperationScrappedQty: extra?.reportedOperationScrappedQty,
            serialNumbers: extra?.serialNumbers,
            scrappedSerialNumbers: extra?.scrappedSerialNumbers,
            overrideReceiptWarehouseId,
            receiptWarehouseChangeReason,
            receiptLocationId: extra?.receiptLocationId,
            storageLocation: extra?.storageLocation,
            demandLineId: extra?.demandLineId,
          };
          if (
            payload.equipmentSessionId &&
            payload.timeSource === ReportOperationDto.timeSource.SESSION &&
            payload.endedAt
          ) {
            reportResult = await workOrderService.endSessionAndReportOperation({
              ...payload,
              equipmentSessionId: payload.equipmentSessionId,
            });
          } else {
            reportResult = await workOrderService.reportOperation(payload);
          }
        } else {
          const payload: Parameters<typeof workOrderService.reportDirect>[0] & {
            equipmentId?: string;
          } = {
            id,
            scheduleEntryId,
            occurredAt: occurredAt ? toISO(occurredAt) : undefined,
            completedQty,
            scrappedQty,
            remark: remark || undefined,
            equipmentId,
            batchNo: batchNo || undefined,
            serialNumbers: extra?.serialNumbers,
            scrappedSerialNumbers: extra?.scrappedSerialNumbers,
            reporterId,
            scrapReason,
            scrapPhotoUrls,
            photoUrls,
            overrideReceiptWarehouseId,
            receiptWarehouseChangeReason,
            receiptLocationId: extra?.receiptLocationId,
            storageLocation: extra?.storageLocation,
            demandLineId: extra?.demandLineId,
          };
          reportResult = await workOrderService.reportDirect(payload);
        }
        toast.success('报工成功');
        const toolingLifeWarnings = getToolingLifeWarningMessages(reportResult);
        if (toolingLifeWarnings.length > 0) {
          toast.info(toolingLifeWarnings.join('\n'), '工装寿命需手工补录');
        }
        await reload();
        // pending_confirmation 模式：报工返回入库摘要时弹出摘要弹窗；无摘要字段时行为完全不变
        const receiptSummary = extractProductionReceiptSummary(reportResult);
        if (receiptSummary && receiptSummary.mode === 'pending_confirmation') {
          setReportReceiptSummary(receiptSummary);
        }
      } catch (e: unknown) {
        const err = e as Error & { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || err.message || '报工失败');
        // 抛出让调用方（ReportModal）感知失败：失败时保留表单内容，便于补填后重交
        throw e;
      } finally {
        setActionLoading(false);
      }
    },
    [id, reload],
  );

  const handleBatchReportSubmit = useCallback(
    async (items: BatchReportInput[], reporterId?: string) => {
      setActionLoading(true);
      try {
        const dto: { workOrderId: string; items: BatchReportItemDto[] } = {
          workOrderId: id,
          items: items.map((i) => ({
            operationId: i.operationId,
            scheduleEntryId: i.scheduleEntryId,
            equipmentId: i.equipmentId,
            occurredAt: i.occurredAt ? toISO(i.occurredAt) : undefined,
            completedQty: i.completedQty,
            scrappedQty: i.scrappedQty || undefined,
            reportedOperationQty: i.reportedOperationQty,
            reportedOperationScrappedQty: i.reportedOperationScrappedQty,
            demandLineId: i.demandLineId,
            scrapReason: i.scrapReason || undefined,
            scrapPhotoUrls: i.scrapPhotoUrls?.length ? i.scrapPhotoUrls : undefined,
            photoUrls: i.photoUrls?.length ? i.photoUrls : undefined,
            remark: i.remark || undefined,
            reporterId,
            isAuxiliary: i.isAuxiliary || undefined,
          })) as BatchReportItemDto[],
        };
        const result = await workOrderService.batchReport(dto);
        const { summary } = result;
        if (summary.failed === 0) {
          toast.success(`${summary.success} 道工序报工成功`);
        } else {
          toast.info(`成功 ${summary.success}，失败 ${summary.failed}（共 ${summary.total}）`);
        }
        await reload();
      } catch (e: unknown) {
        const err = e as Error & { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || err.message || '批量报工失败');
      } finally {
        setActionLoading(false);
      }
    },
    [id, reload],
  );

  const handleRevokeSubmit = useCallback(
    async (
      revokeCompletedQty: number,
      revokeScrapQty: number,
      remark: string,
      operationId: string,
    ) => {
      runAction(
        () =>
          workOrderService
            .revokeReport({
              workOrderId: id,
              operationId,
              revokeCompletedQty,
              revokeScrapQty,
              remark,
            })
            .then(() => {}),
        '冲正成功',
      );
    },
    [id, runAction],
  );

  const handleRevokeReportLog = useCallback(
    async (record: ReportLogItem) => {
      const isExecutionLog = isExecutionReportLog(record);
      if (isExecutionLog && !record.operationId) {
        toast.info('执行记录缺少工序信息，无法按流水作废');
        return;
      }
      runAction(
        () =>
          (isExecutionLog
            ? workOrderService.revokeOperationExecution({
                workOrderId: id,
                operationId: record.operationId || '',
                reportLogId: record.id,
                remark: '按执行流水精确作废',
              })
            : workOrderService.revokeReport({
                workOrderId: id,
                reportLogId: record.id,
                operationId: record.operationId || undefined,
                revokeCompletedQty: Number(record.completedQty ?? 0),
                revokeScrapQty: Number(record.scrappedQty ?? 0),
                remark: '按报工流水精确冲正',
              })
          ).then(() => {}),
        isExecutionLog ? '作废成功' : '冲正成功',
      );
    },
    [id, runAction],
  );

  const handleAssignSubmit = useCallback(
    async (assigneeId: string, operationId: string) => {
      runAction(
        () =>
          workOrderService
            .assignOperation({ workOrderId: id, operationId, assigneeId })
            .then(() => {}),
        '指派成功',
      );
    },
    [id, runAction],
  );

  const handleRemoveOperation = useCallback(
    (op: WorkOrderOperation) =>
      confirmAlert(
        '删除工序',
        `确认删除工序「${op.operationName}」？`,
        () =>
          runAction(
            () => workOrderService.removeOperation({ workOrderId: id, operationId: op.id }),
            '工序已删除',
          ),
        '删除',
        true,
      ),
    [id, runAction],
  );

  return {
    actionLoading,
    readinessOverrideModal: createElement(ReadinessOverrideModal, {
      visible: !!readinessOverridePrompt,
      title: readinessOverridePrompt?.title ?? '',
      message: readinessOverridePrompt?.message ?? '',
      confirmText: readinessOverridePrompt?.confirmText ?? '确认',
      reasonRequired: readinessOverridePrompt?.reasonRequired ?? true,
      loading: actionLoading,
      onClose: () => setReadinessOverridePrompt(null),
      onSubmit: handleReadinessOverrideSubmit,
    }),
    startScheduleEntrySheet: createElement(StartScheduleEntrySheet, {
      visible: !!startScheduleEntryPrompt,
      entries: startScheduleEntryPrompt?.entries ?? [],
      orderNo,
      loading: actionLoading,
      onClose: () => setStartScheduleEntryPrompt(null),
      onSubmit: handleStartScheduleEntrySubmit,
    }),
    reportReceiptSummarySheet: createElement(ReportReceiptSummarySheet, {
      summary: reportReceiptSummary,
      onClose: () => setReportReceiptSummary(null),
    }),
    handleSubmitApproval,
    handleRelease,
    handleStart,
    handlePause,
    handleResume,
    handleComplete,
    handleReopen,
    handleClose,
    handleDelete,
    handleCancel,
    handleCopy,
    handleCreateSubAssembly,
    handleSplitSubmit,
    handleQuantityActionSubmit,
    handleReportSubmit,
    handleBatchReportSubmit,
    handleRevokeSubmit,
    handleRevokeReportLog,
    handleAssignSubmit,
    handleRemoveOperation,
  };
}
