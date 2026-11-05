import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { WorkOrderOperation } from '../../../host/services';
import { OperationOutputMode } from '../../../types/models/OperationOutputMode';
import type { OperationScheduleSlotDto } from '../../../types/models/OperationScheduleSlotDto';
import { TimeCaptureMode } from '../../../types/models/TimeCaptureMode';
import type { WorkOrderDemandAllocationTraceDto } from '../../../types/models/WorkOrderDemandAllocationTraceDto';
import { equipmentSessionService } from '../../../host/services';
import { uploadService } from '../../../host/services';
import { userService } from '../../../host/services';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FormField, FormSwitch } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { PhotoPicker } from '../../../../core/components/PhotoPicker.tsx';
import { ProgressBar } from '../../../../core/components/ProgressBar.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { P } from '../../../host/authorization';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { usePermission } from '../../../host/hooks/usePermission';
import { useTheme } from '../../../../core/theme/useTheme';
import { ReportDemandSourceField } from './ReportDemandSourceField.tsx';
import {
  getOperationReportConstraint,
  isBatchReportCandidateOperation,
  sortOperationsForReporting,
} from '../../../screen-support/work-orders/reporting-constraints';
import {
  formatScheduleSlotLabel,
  formatScheduleSlotSublabel,
} from '../../../screen-support/work-orders/utils/schedule-slot-display';
import { useAuthStore } from '../../../host/state/auth.store';
import { formatShortDateTime, now } from '../../../../core/utils/date';
import { formatNumber } from '../../../../core/utils/format';
import { toast } from '../../../../core/toast';

const EMPTY_DEMAND_ALLOCATIONS: WorkOrderDemandAllocationTraceDto[] = [];

// ─── Types ────────────────────────────────────────────────────────────────────

interface BatchReportItem {
  operationId: string;
  operationName: string;
  scheduleEntryId?: string;
  scheduleSlotLabel?: string;
  equipmentId?: string;
  autoMatchedByCurrentUser?: boolean;
  occurredAt: string;
  completedQty: number;
  scrappedQty: number;
  reportedOperationQty?: number;
  reportedOperationScrappedQty?: number;
  scrapReason?: string;
  scrapPhotoUris?: string[];
  scrapPhotoUrls?: string[];
  photoUris?: string[];
  photoUrls?: string[];
  remark: string;
  isAuxiliary?: boolean;
  demandLineId?: string;
}

export interface BatchReportModalProps {
  visible: boolean;
  /** 工单全部工序列表（用于步骤展示与前序约束判断） */
  operations: WorkOrderOperation[];
  demandAllocations?: WorkOrderDemandAllocationTraceDto[];
  /** 物料单位 */
  unit: string;
  onClose: () => void;
  onSubmit: (items: BatchReportItem[], reporterId?: string) => Promise<void> | void;
}

type Step = 'input' | 'review';
type OperationScheduleSlot = OperationScheduleSlotDto;
type OperationWithScheduleSlots = WorkOrderOperation & {
  scheduleSlots?: OperationScheduleSlot[];
};

function parseQtyValue(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getScheduleSlots(op: WorkOrderOperation | null): OperationScheduleSlot[] {
  if (!op) return [];
  return ((op as OperationWithScheduleSlots).scheduleSlots ?? []) as OperationScheduleSlot[];
}

function findSessionMatchedScheduleSlot(
  slots: OperationScheduleSlot[],
  equipmentId?: string | null,
): OperationScheduleSlot | null {
  if (!equipmentId || slots.length <= 1) return null;
  const matches = slots.filter((slot) => slot.equipmentId === equipmentId);
  return matches.length === 1 ? matches[0] : null;
}

function isBatchReportableOperation(op: WorkOrderOperation): boolean {
  return (
    op.isOutsourced !== true &&
    op.operationOutputMode !== OperationOutputMode.NON_OUTPUT_EXECUTION &&
    op.operationOutputMode !== OperationOutputMode.EXECUTION_QUANTITY &&
    op.timeCaptureMode !== TimeCaptureMode.SESSION_REQUIRED
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BatchReportModal({
  visible,
  operations,
  demandAllocations = EMPTY_DEMAND_ALLOCATIONS,
  unit,
  onClose,
  onSubmit,
}: BatchReportModalProps) {
  const currentUser = useAuthStore((s) => s.user);
  const canReadCurrentEquipmentSession = usePermission(P.EQUIPMENT_SESSION_START);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<Step>('input');
  const [items, setItems] = useState<Map<string, BatchReportItem>>(new Map());

  // 当前工序的表单状态
  const [completedQty, setCompletedQty] = useState('');
  const [scrappedQty, setScrappedQty] = useState('0');
  const [scrapReason, setScrapReason] = useState('');
  const [scrapPhotos, setScrapPhotos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [remark, setRemark] = useState('');
  const [isAuxiliary, setIsAuxiliary] = useState(false);
  const [occurredAt, setOccurredAt] = useState(now());
  const [submitting, setSubmitting] = useState(false);
  const [selectedScheduleSlot, setSelectedScheduleSlot] = useState<OperationScheduleSlot | null>(
    null,
  );
  const [
    selectedScheduleSlotAutoMatchedByCurrentUser,
    setSelectedScheduleSlotAutoMatchedByCurrentUser,
  ] = useState(false);
  const [currentSessionEquipmentId, setCurrentSessionEquipmentId] = useState<string | null>(null);
  const [reporter, setReporter] = useState<{
    id: string;
    username: string;
    realName?: string | null;
  } | null>(null);
  const [selectedDemandLineId, setSelectedDemandLineId] = useState<string | null>(null);

  const allOperations = useMemo(() => sortOperationsForReporting(operations), [operations]);
  const demandSources = useMemo(() => {
    const unique = new Map<string, WorkOrderDemandAllocationTraceDto>();
    for (const allocation of demandAllocations) {
      if (allocation.demandStatus === 'cancelled' || allocation.demandStatus === 'closed') continue;
      unique.set(allocation.demandLineId, allocation);
    }
    return [...unique.values()];
  }, [demandAllocations]);
  const reportableOperations = useMemo(
    () =>
      allOperations.filter(
        (op) => isBatchReportableOperation(op) && isBatchReportCandidateOperation(op),
      ),
    [allOperations],
  );
  const currentOp = reportableOperations[currentIndex] ?? null;
  const totalOps = reportableOperations.length;
  const draftCompletedQtyByOperationId = useMemo(
    () => new Map(Array.from(items.values()).map((item) => [item.operationId, item.completedQty])),
    [items],
  );

  // 当前工序剩余可报数量
  const currentConstraint = useMemo(
    () =>
      currentOp
        ? getOperationReportConstraint(allOperations, currentOp, draftCompletedQtyByOperationId)
        : null,
    [allOperations, currentOp, draftCompletedQtyByOperationId],
  );
  const maxQty = currentConstraint?.maxQty ?? 0;
  const completedQtyValue = parseQtyValue(completedQty);
  const scrappedQtyValue = parseQtyValue(scrappedQty);
  const totalQty = completedQtyValue + scrappedQtyValue;
  const remainingAfterReport = Math.max(0, maxQty - totalQty);
  const formatReportQty = (value: number) =>
    formatNumber(value, { fallback: '0', maximumFractionDigits: 4 });
  const completedMax = Math.max(0, maxQty - scrappedQtyValue);
  const scrappedMax = Math.max(0, maxQty - completedQtyValue);
  const currentBlockReason =
    currentOp?.reportBlockReason && maxQty <= 0 ? currentOp.reportBlockReason : undefined;
  const outputLimitHint =
    currentBlockReason ??
    `当前最多可报 ${formatReportQty(maxQty)}。如实际多做成品，请先追加投产或补加工单；如果只是加工次数，请记录执行量。`;
  const completedQtyError = completedQtyValue > completedMax ? outputLimitHint : undefined;
  const scrappedQtyError = scrappedQtyValue > scrappedMax ? outputLimitHint : undefined;
  const currentConstraintHint = currentBlockReason
    ? currentBlockReason
    : currentConstraint?.upstreamOp && currentConstraint.transferGateOpen
      ? `受上道「${currentConstraint.upstreamOp.operationName}」累计良品 ${currentConstraint.upstreamGoodQty ?? 0} ${unit} 限制`
      : currentConstraint?.upstreamOp
        ? `需前道「${currentConstraint.upstreamOp.operationName}」累计良品至少 ${currentConstraint.transferBatchQty} ${unit}，当前 ${currentConstraint.upstreamGoodQty ?? 0} ${unit}`
        : undefined;

  // 重置 / 初始化
  useEffect(() => {
    if (visible && currentUser) {
      setReporter({
        id: currentUser.id,
        username: currentUser.username,
        realName: currentUser.realName,
      });
    }
    if (!visible) {
      setCurrentIndex(0);
      setStep('input');
      setItems(new Map());
      setCompletedQty('');
      setScrappedQty('0');
      setScrapReason('');
      setScrapPhotos([]);
      setPhotos([]);
      setRemark('');
      setIsAuxiliary(false);
      setOccurredAt(now());
      setSubmitting(false);
      setSelectedScheduleSlot(null);
      setSelectedScheduleSlotAutoMatchedByCurrentUser(false);
      setCurrentSessionEquipmentId(null);
      setReporter(null);
      setSelectedDemandLineId(null);
    }
  }, [visible, currentUser]);

  useEffect(() => {
    let cancelled = false;
    if (!visible || !currentUser?.id || !canReadCurrentEquipmentSession) {
      setCurrentSessionEquipmentId(null);
      return () => {
        cancelled = true;
      };
    }

    void equipmentSessionService
      .myCurrent()
      .then((session) => {
        if (cancelled) return;
        setCurrentSessionEquipmentId(session?.equipmentId ?? null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.warn('Failed to preload current equipment session for batch report', error);
        setCurrentSessionEquipmentId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [canReadCurrentEquipmentSession, visible, currentUser?.id]);

  // 切换工序时加载已保存数据或重置
  useEffect(() => {
    if (!currentOp || step !== 'input') return;
    const saved = items.get(currentOp.id);
    const scheduleSlots = getScheduleSlots(currentOp);
    if (saved) {
      setCompletedQty(saved.completedQty > 0 ? String(saved.completedQty) : '');
      setScrappedQty(String(saved.scrappedQty));
      setScrapReason(saved.scrapReason ?? '');
      setScrapPhotos(saved.scrapPhotoUris ?? []);
      setPhotos(saved.photoUris ?? []);
      setRemark(saved.remark);
      setIsAuxiliary(saved.isAuxiliary ?? false);
      setOccurredAt(saved.occurredAt || now());
      setSelectedScheduleSlot(
        saved.scheduleEntryId
          ? (scheduleSlots.find((slot) => slot.id === saved.scheduleEntryId) ?? null)
          : scheduleSlots.length === 1
            ? scheduleSlots[0]
            : null,
      );
      setSelectedScheduleSlotAutoMatchedByCurrentUser(saved.autoMatchedByCurrentUser ?? false);
    } else {
      setCompletedQty('');
      setScrappedQty('0');
      setScrapReason('');
      setScrapPhotos([]);
      setPhotos([]);
      setRemark('');
      setIsAuxiliary(false);
      setOccurredAt(now());
      const matchedSlot =
        reporter?.id === currentUser?.id
          ? findSessionMatchedScheduleSlot(scheduleSlots, currentSessionEquipmentId)
          : null;
      setSelectedScheduleSlot(scheduleSlots.length === 1 ? scheduleSlots[0] : matchedSlot);
      setSelectedScheduleSlotAutoMatchedByCurrentUser(Boolean(matchedSlot));
    }
  }, [currentOp, step, items, reporter?.id, currentUser?.id, currentSessionEquipmentId]);

  useEffect(() => {
    if (!visible || !currentOp) return;
    if (!reporter?.id || reporter.id === currentUser?.id) return;
    if (selectedScheduleSlotAutoMatchedByCurrentUser) {
      setSelectedScheduleSlot(null);
      setSelectedScheduleSlotAutoMatchedByCurrentUser(false);
    }
  }, [
    visible,
    currentOp,
    reporter?.id,
    currentUser?.id,
    selectedScheduleSlotAutoMatchedByCurrentUser,
  ]);

  useEffect(() => {
    if (!visible) return;
    if (!reporter?.id || reporter.id === currentUser?.id) return;
    setItems((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const op of allOperations) {
        const saved = next.get(op.id);
        if (!saved?.autoMatchedByCurrentUser) continue;
        next.set(op.id, {
          ...saved,
          scheduleEntryId: undefined,
          scheduleSlotLabel: undefined,
          equipmentId: undefined,
          autoMatchedByCurrentUser: undefined,
        });
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [visible, reporter?.id, currentUser?.id, allOperations]);

  const saveCurrentItem = useCallback(() => {
    if (!currentOp) return false;
    const scheduleSlots = getScheduleSlots(currentOp);
    const resolvedScheduleSlot =
      selectedScheduleSlot ?? (scheduleSlots.length === 1 ? scheduleSlots[0] : null);
    const qty = completedQtyValue;
    const scrap = scrappedQtyValue;
    if (qty + scrap <= 0) {
      toast.info('请至少填写良品数量或报废数量');
      return false;
    }
    if (qty + scrap > maxQty) {
      toast.info(outputLimitHint);
      return false;
    }
    const trimmedScrapReason = scrapReason.trim() || undefined;
    if (scrap > 0 && !trimmedScrapReason) {
      toast.info(`工序「${currentOp.operationName}」有报废数量时必须填写报废原因`);
      return false;
    }
    if (scheduleSlots.length > 1 && !resolvedScheduleSlot) {
      toast.info(`工序「${currentOp.operationName}」请选择具体排产实例`);
      return false;
    }
    setItems((prev) => {
      const next = new Map(prev);
      next.set(currentOp.id, {
        operationId: currentOp.id,
        operationName: currentOp.operationName,
        scheduleEntryId: scheduleSlots.length > 1 ? resolvedScheduleSlot?.id : undefined,
        scheduleSlotLabel: resolvedScheduleSlot
          ? formatScheduleSlotLabel(resolvedScheduleSlot)
          : undefined,
        equipmentId: resolvedScheduleSlot?.equipmentId ?? undefined,
        autoMatchedByCurrentUser: selectedScheduleSlotAutoMatchedByCurrentUser || undefined,
        occurredAt,
        completedQty: qty,
        scrappedQty: scrap,
        scrapReason: trimmedScrapReason,
        scrapPhotoUris: scrap > 0 ? scrapPhotos : undefined,
        photoUris: photos.length > 0 ? photos : undefined,
        remark,
        isAuxiliary: isAuxiliary || undefined,
      });
      return next;
    });
    return true;
  }, [
    currentOp,
    completedQtyValue,
    scrappedQtyValue,
    isAuxiliary,
    maxQty,
    occurredAt,
    scrapReason,
    scrapPhotos,
    photos,
    remark,
    selectedScheduleSlot,
    selectedScheduleSlotAutoMatchedByCurrentUser,
    outputLimitHint,
  ]);

  const handleNext = useCallback(() => {
    if (!saveCurrentItem()) return;
    if (currentIndex < totalOps - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setStep('review');
    }
  }, [saveCurrentItem, currentIndex, totalOps]);

  const handlePrev = useCallback(() => {
    if (step === 'review') {
      setStep('input');
      return;
    }
    if (currentIndex > 0) {
      // 保存当前（静默失败也没关系，用户回退不强制校验）
      if (
        completedQty.trim() !== '' ||
        scrappedQtyValue > 0 ||
        scrapReason.trim() !== '' ||
        scrapPhotos.length > 0 ||
        photos.length > 0 ||
        remark.trim() !== '' ||
        isAuxiliary
      ) {
        saveCurrentItem();
      }
      setCurrentIndex((i) => i - 1);
    }
  }, [
    step,
    currentIndex,
    completedQty,
    scrappedQtyValue,
    scrapReason,
    scrapPhotos,
    photos,
    remark,
    isAuxiliary,
    saveCurrentItem,
  ]);

  const handleSkip = useCallback(() => {
    // 跳过 = 不报这道工序，清除已保存的数据
    if (currentOp) {
      setItems((prev) => {
        const next = new Map(prev);
        next.delete(currentOp.id);
        return next;
      });
    }
    if (currentIndex < totalOps - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setStep('review');
    }
  }, [currentOp, currentIndex, totalOps]);

  const handleFillAll = useCallback(() => {
    const filled = new Map<string, BatchReportItem>();
    const draftCompleted = new Map<string, number>();
    const defaultOccurredAt = now();
    for (const op of reportableOperations) {
      const remaining = getOperationReportConstraint(allOperations, op, draftCompleted).maxQty;
      const scheduleSlots = getScheduleSlots(op);
      const matchedSlot =
        reporter?.id === currentUser?.id
          ? findSessionMatchedScheduleSlot(scheduleSlots, currentSessionEquipmentId)
          : null;
      const autoBoundScheduleSlot = scheduleSlots.length === 1 ? scheduleSlots[0] : matchedSlot;
      if (remaining > 0) {
        filled.set(op.id, {
          operationId: op.id,
          operationName: op.operationName,
          scheduleEntryId: scheduleSlots.length > 1 ? autoBoundScheduleSlot?.id : undefined,
          scheduleSlotLabel: autoBoundScheduleSlot
            ? formatScheduleSlotLabel(autoBoundScheduleSlot)
            : undefined,
          equipmentId: autoBoundScheduleSlot?.equipmentId ?? undefined,
          autoMatchedByCurrentUser: matchedSlot ? true : undefined,
          occurredAt: defaultOccurredAt,
          completedQty: remaining,
          scrappedQty: 0,
          remark: '',
        });
        draftCompleted.set(op.id, remaining);
      }
    }
    setItems(filled);
    setStep('review');
  }, [
    allOperations,
    reportableOperations,
    reporter?.id,
    currentUser?.id,
    currentSessionEquipmentId,
  ]);

  const handleConfirm = useCallback(async () => {
    const draftCompleted = new Map<string, number>();
    for (const op of reportableOperations) {
      const item = items.get(op.id);
      if (!item) continue;
      const allowedQty = getOperationReportConstraint(allOperations, op, draftCompleted).maxQty;
      const itemTotal = item.completedQty + item.scrappedQty;
      const scheduleSlots = getScheduleSlots(op);
      if (itemTotal <= 0) {
        setStep('input');
        setCurrentIndex(reportableOperations.findIndex((candidate) => candidate.id === op.id));
        toast.info(`工序「${op.operationName}」请至少填写良品数量或报废数量`);
        return;
      }
      if (itemTotal > allowedQty) {
        setStep('input');
        setCurrentIndex(reportableOperations.findIndex((candidate) => candidate.id === op.id));
        toast.info(`工序「${op.operationName}」的良品 + 报废不能超过 ${allowedQty}`);
        return;
      }
      if (!item.occurredAt) {
        setStep('input');
        setCurrentIndex(reportableOperations.findIndex((candidate) => candidate.id === op.id));
        toast.info(`工序「${op.operationName}」请选择实际发生时间`);
        return;
      }
      if (scheduleSlots.length > 1 && !item.scheduleEntryId) {
        setStep('input');
        setCurrentIndex(reportableOperations.findIndex((candidate) => candidate.id === op.id));
        toast.info(`工序「${op.operationName}」请选择具体排产实例`);
        return;
      }
      if (item.scrappedQty > 0 && !item.scrapReason?.trim()) {
        setStep('input');
        setCurrentIndex(reportableOperations.findIndex((candidate) => candidate.id === op.id));
        toast.info(`工序「${op.operationName}」有报废数量时必须填写报废原因`);
        return;
      }
      draftCompleted.set(op.id, item.completedQty);
    }

    const reportItems = reportableOperations
      .map((op) => items.get(op.id))
      .filter((item): item is BatchReportItem => item != null);
    if (reportItems.length === 0) {
      toast.info('至少需要报工一个工序');
      return;
    }
    if (
      reportItems.some((item) => item.completedQty + item.scrappedQty > 0) &&
      demandSources.length > 1 &&
      !selectedDemandLineId
    ) {
      toast.info('请选择本次报工对应的来源订单');
      return;
    }
    const reporterId =
      reporter && currentUser && reporter.id !== currentUser.id ? reporter.id : undefined;
    setSubmitting(true);
    try {
      const uploadedItems = await Promise.all(
        reportItems.map(async (item) => {
          const [scrapPhotoUrls, photoUrls] = await Promise.all([
            item.scrappedQty > 0 && (item.scrapPhotoUris?.length ?? 0) > 0
              ? uploadService.uploadImages(item.scrapPhotoUris ?? [])
              : Promise.resolve([]),
            (item.photoUris?.length ?? 0) > 0
              ? uploadService.uploadImages(item.photoUris ?? [])
              : Promise.resolve([]),
          ]);
          return {
            ...item,
            demandLineId:
              selectedDemandLineId ||
              (demandSources.length === 1 ? demandSources[0].demandLineId : undefined),
            scrapPhotoUrls: scrapPhotoUrls.length > 0 ? scrapPhotoUrls : undefined,
            photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
          };
        }),
      );
      await onSubmit(uploadedItems, reporterId);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '批量报工失败');
    } finally {
      setSubmitting(false);
    }
  }, [
    allOperations,
    items,
    reportableOperations,
    onSubmit,
    reporter,
    currentUser,
    demandSources,
    selectedDemandLineId,
  ]);

  const handleRemoveItem = useCallback((opId: string) => {
    setItems((prev) => {
      const next = new Map(prev);
      next.delete(opId);
      return next;
    });
  }, []);

  const reportedCount = items.size;
  const handleReporterChange = (
    nextReporter: {
      id: string;
      username: string;
      realName?: string | null;
    } | null,
  ) => {
    setReporter(nextReporter);
  };

  const handleScheduleSlotChange = (slot: OperationScheduleSlot | null) => {
    setSelectedScheduleSlotAutoMatchedByCurrentUser(false);
    setSelectedScheduleSlot(slot);
  };

  if (totalOps === 0) return null;

  const title = step === 'review' ? '确认批量报工' : `批量报工 ${currentIndex + 1}/${totalOps}`;

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title={title}
      avoidKeyboard
      renderFooter={() =>
        step === 'input' ? (
          <InputFooter
            currentIndex={currentIndex}
            totalOps={totalOps}
            onPrev={handlePrev}
            onSkip={handleSkip}
            onNext={handleNext}
            onFillAll={handleFillAll}
          />
        ) : (
          <ReviewFooter
            count={reportedCount}
            loading={submitting}
            onBack={handlePrev}
            onConfirm={handleConfirm}
          />
        )
      }
    >
      <EntityPickerField<{ id: string; username: string; realName?: string | null }>
        label="报工人"
        value={reporter}
        onChange={handleReporterChange}
        fetchFn={userService.listForPicker}
        keyExtractor={(u) => u.id}
        labelExtractor={(u) => u.realName || u.username}
        sublabelExtractor={(u) => (u.realName ? u.username : '')}
        title="选择报工人"
        placeholder="默认当前用户"
      />
      <ReportDemandSourceField
        allocations={demandSources}
        value={selectedDemandLineId}
        onChange={setSelectedDemandLineId}
      />

      {step === 'input' && currentOp && (
        <InputStep
          op={currentOp}
          scheduleSlots={getScheduleSlots(currentOp)}
          selectedScheduleSlot={selectedScheduleSlot}
          maxQty={maxQty}
          completedMax={completedMax}
          scrappedMax={scrappedMax}
          completedQtyError={completedQtyError}
          scrappedQtyError={scrappedQtyError}
          unit={unit}
          currentIndex={currentIndex}
          totalOps={totalOps}
          completedQty={completedQty}
          scrappedQty={scrappedQty}
          scrapReason={scrapReason}
          scrapPhotos={scrapPhotos}
          photos={photos}
          remark={remark}
          isAuxiliary={isAuxiliary}
          occurredAt={occurredAt}
          summaryText={`本次合计 ${formatReportQty(totalQty)}，报后剩余 ${formatReportQty(remainingAfterReport)}`}
          constraintHint={currentConstraintHint}
          onCompletedQtyChange={setCompletedQty}
          onScrappedQtyChange={setScrappedQty}
          onScrapReasonChange={setScrapReason}
          onScrapPhotosChange={setScrapPhotos}
          onPhotosChange={setPhotos}
          onRemarkChange={setRemark}
          onAuxiliaryChange={setIsAuxiliary}
          onOccurredAtChange={setOccurredAt}
          onScheduleSlotChange={handleScheduleSlotChange}
        />
      )}

      {step === 'review' && (
        <ReviewStep
          items={reportableOperations
            .map((op) => items.get(op.id))
            .filter((item): item is BatchReportItem => item != null)}
          unit={unit}
          onRemove={handleRemoveItem}
        />
      )}
    </FullScreenModal>
  );
}

// ─── InputStep ────────────────────────────────────────────────────────────────

interface InputStepProps {
  op: WorkOrderOperation;
  scheduleSlots: OperationScheduleSlot[];
  selectedScheduleSlot: OperationScheduleSlot | null;
  maxQty: number;
  completedMax: number;
  scrappedMax: number;
  completedQtyError?: string;
  scrappedQtyError?: string;
  unit: string;
  currentIndex: number;
  totalOps: number;
  completedQty: string;
  scrappedQty: string;
  scrapReason: string;
  scrapPhotos: string[];
  photos: string[];
  remark: string;
  isAuxiliary: boolean;
  occurredAt: string;
  summaryText: string;
  constraintHint?: string;
  onCompletedQtyChange: (v: string) => void;
  onScrappedQtyChange: (v: string) => void;
  onScrapReasonChange: (v: string) => void;
  onScrapPhotosChange: (v: string[]) => void;
  onPhotosChange: (v: string[]) => void;
  onRemarkChange: (v: string) => void;
  onAuxiliaryChange: (v: boolean) => void;
  onOccurredAtChange: (v: string) => void;
  onScheduleSlotChange: (slot: OperationScheduleSlot | null) => void;
}

function InputStep({
  op,
  scheduleSlots,
  selectedScheduleSlot,
  maxQty,
  completedMax,
  scrappedMax,
  completedQtyError,
  scrappedQtyError,
  unit,
  currentIndex,
  totalOps,
  completedQty,
  scrappedQty,
  scrapReason,
  scrapPhotos,
  photos,
  remark,
  isAuxiliary,
  occurredAt,
  summaryText,
  constraintHint,
  onCompletedQtyChange,
  onScrappedQtyChange,
  onScrapReasonChange,
  onScrapPhotosChange,
  onPhotosChange,
  onRemarkChange,
  onAuxiliaryChange,
  onOccurredAtChange,
  onScheduleSlotChange,
}: InputStepProps) {
  const { colors } = useTheme();
  const scrappedQtyValue = parseQtyValue(scrappedQty);
  const localScheduleSlotFetch = async ({
    page,
    pageSize,
    keyword,
  }: {
    page: number;
    pageSize: number;
    keyword?: string;
  }) => {
    const normalizedKeyword = keyword?.trim().toLowerCase();
    const filtered = normalizedKeyword
      ? scheduleSlots.filter((slot) => {
          const label = formatScheduleSlotLabel(slot).toLowerCase();
          const sublabel = formatScheduleSlotSublabel(slot).toLowerCase();
          return label.includes(normalizedKeyword) || sublabel.includes(normalizedKeyword);
        })
      : scheduleSlots;
    const start = (page - 1) * pageSize;
    return {
      list: filtered.slice(start, start + pageSize),
      total: filtered.length,
    };
  };

  return (
    <>
      <ProgressBar current={currentIndex + 1} target={totalOps} height={3} />

      <View style={[styles.opInfo, { backgroundColor: colors.surfaceSecondary }]}>
        <View style={styles.opInfoHeader}>
          <View style={[styles.seqBadge, { backgroundColor: `${colors.primary}18` }]}>
            <Text style={[styles.seqText, { color: colors.primary }]}>#{op.sequence}</Text>
          </View>
          <Text style={[styles.opName, { color: colors.text }]}>{op.operationName}</Text>
        </View>
        <Text style={[styles.opRemaining, { color: colors.textSecondary }]}>
          剩余 {maxQty} {unit}
        </Text>
      </View>

      <Text style={[styles.inputSummaryText, { color: colors.textSecondary }]}>{summaryText}</Text>
      {constraintHint ? (
        <Text style={[styles.constraintText, { color: colors.warning }]}>{constraintHint}</Text>
      ) : null}
      <DatePickerField
        label="实际发生时间"
        value={occurredAt}
        onChange={onOccurredAtChange}
        mode="datetime"
        showCurrentShortcut
        clearable={false}
      />
      {scheduleSlots.length > 1 ? (
        <>
          <EntityPickerField<OperationScheduleSlot>
            label="排产实例"
            value={selectedScheduleSlot}
            onChange={onScheduleSlotChange}
            fetchFn={localScheduleSlotFetch}
            keyExtractor={(slot) => slot.id}
            labelExtractor={formatScheduleSlotLabel}
            sublabelExtractor={formatScheduleSlotSublabel}
            title="选择排产实例"
            placeholder="请选择设备/时间段"
            clearable={false}
          />
          <Text style={[styles.constraintText, { color: colors.warning }]}>
            同一工序存在多条排产实例，批量报工也必须逐道明确绑定实例。
          </Text>
        </>
      ) : scheduleSlots.length === 1 ? (
        <View style={[styles.scheduleSlotCard, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.scheduleSlotLabel, { color: colors.textSecondary }]}>
            已自动绑定排产实例
          </Text>
          <Text style={[styles.scheduleSlotValue, { color: colors.text }]}>
            {formatScheduleSlotLabel(scheduleSlots[0])}
          </Text>
          {formatScheduleSlotSublabel(scheduleSlots[0]) ? (
            <Text style={[styles.scheduleSlotMeta, { color: colors.textSecondary }]}>
              {formatScheduleSlotSublabel(scheduleSlots[0])}
            </Text>
          ) : null}
        </View>
      ) : null}

      {op.auxiliaryPriceRatioSnapshot != null && op.auxiliaryPriceRatioSnapshot > 0 && (
        <>
          <FormSwitch label="辅操报工" value={isAuxiliary} onValueChange={onAuxiliaryChange} />
          {isAuxiliary && op.pieceRateSnapshot != null && (
            <Text style={[styles.auxiliaryHint, { color: colors.textSecondary }]}>
              辅操工价: ¥{(op.pieceRateSnapshot * op.auxiliaryPriceRatioSnapshot).toFixed(2)}（主操
              ¥{op.pieceRateSnapshot.toFixed(2)} × {op.auxiliaryPriceRatioSnapshot}）
            </Text>
          )}
        </>
      )}

      <QuickNumInput
        label="良品数量"
        value={completedQty}
        onChangeText={onCompletedQtyChange}
        max={completedMax}
        hint={`最多 ${formatNumber(completedMax, { fallback: '0', maximumFractionDigits: 4 })}`}
        error={completedQtyError}
        clampToBounds={false}
        unit={unit}
        placeholder="0"
      />

      <QuickNumInput
        label="报废数量"
        value={scrappedQty}
        onChangeText={onScrappedQtyChange}
        max={scrappedMax}
        hint={`最多 ${formatNumber(scrappedMax, { fallback: '0', maximumFractionDigits: 4 })}`}
        error={scrappedQtyError}
        clampToBounds={false}
        quickButtons={[
          { label: '0', value: 'min' },
          { label: '+1', value: 1 },
        ]}
        unit={unit}
        placeholder="0"
      />

      {scrappedQtyValue > 0 ? (
        <>
          <FormField
            label="报废原因"
            value={scrapReason}
            onChangeText={onScrapReasonChange}
            placeholder="请输入报废原因"
            multiline
            numberOfLines={2}
          />
          <PhotoPicker
            photos={scrapPhotos}
            onPhotosChange={onScrapPhotosChange}
            maxCount={5}
            label="报废照片"
          />
          <Text style={[styles.constraintText, { color: colors.textSecondary }]}>
            若命中的报废策略要求照片，未上传会被后端拦截。
          </Text>
        </>
      ) : null}

      <PhotoPicker
        photos={photos}
        onPhotosChange={onPhotosChange}
        maxCount={5}
        label="现场照片（可选）"
      />

      <FormField
        label="备注"
        value={remark}
        onChangeText={onRemarkChange}
        placeholder="可选备注"
        multiline
        numberOfLines={2}
      />
    </>
  );
}

// ─── ReviewStep ───────────────────────────────────────────────────────────────

interface ReviewStepProps {
  items: BatchReportItem[];
  unit: string;
  onRemove: (opId: string) => void;
}

function ReviewStep({ items, unit, onRemove }: ReviewStepProps) {
  const { colors } = useTheme();

  if (items.length === 0) {
    return (
      <View style={styles.emptyReview}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          未填写任何工序报工数据
        </Text>
      </View>
    );
  }

  const totalCompleted = items.reduce((sum, i) => sum + i.completedQty, 0);
  const totalScrapped = items.reduce((sum, i) => sum + i.scrappedQty, 0);

  return (
    <>
      <View style={[styles.summary, { backgroundColor: `${colors.primary}08` }]}>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          共 {items.length} 道工序，良品{' '}
          {formatNumber(totalCompleted, { fallback: '0', maximumFractionDigits: 4 })} {unit}
          {totalScrapped > 0
            ? `，报废 ${formatNumber(totalScrapped, {
                fallback: '0',
                maximumFractionDigits: 4,
              })} ${unit}`
            : ''}
        </Text>
      </View>

      {items.map((item) => (
        <View
          key={item.operationId}
          style={[styles.reviewCard, { backgroundColor: colors.surfaceSecondary }]}
        >
          <View style={styles.reviewCardContent}>
            <Text style={[styles.reviewOpName, { color: colors.text }]}>{item.operationName}</Text>
            <Text style={[styles.reviewQty, { color: colors.textSecondary }]}>
              良品 {formatNumber(item.completedQty, { maximumFractionDigits: 4 })} {unit}
              {item.scrappedQty > 0
                ? ` / 报废 ${formatNumber(item.scrappedQty, {
                    maximumFractionDigits: 4,
                  })} ${unit}`
                : ''}
              {item.isAuxiliary ? ' · 辅操' : ''}
            </Text>
            {item.scheduleSlotLabel ? (
              <Text style={[styles.reviewMeta, { color: colors.textSecondary }]} numberOfLines={2}>
                排产实例：{item.scheduleSlotLabel}
              </Text>
            ) : null}
            <Text style={[styles.reviewMeta, { color: colors.textSecondary }]} numberOfLines={1}>
              实际发生：{formatShortDateTime(item.occurredAt)}
            </Text>
            {item.scrapReason ? (
              <Text style={[styles.reviewMeta, { color: colors.textSecondary }]} numberOfLines={2}>
                报废原因：{item.scrapReason}
              </Text>
            ) : null}
            {item.scrapPhotoUris?.length ? (
              <Text style={[styles.reviewMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                报废照片：{item.scrapPhotoUris.length} 张
              </Text>
            ) : null}
            {item.photoUris?.length ? (
              <Text style={[styles.reviewMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                现场照片：{item.photoUris.length} 张
              </Text>
            ) : null}
            {item.remark ? (
              <Text style={[styles.reviewRemark, { color: colors.textMuted }]} numberOfLines={1}>
                {item.remark}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => onRemove(item.operationId)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
}

// ─── Footers ──────────────────────────────────────────────────────────────────

interface InputFooterProps {
  currentIndex: number;
  totalOps: number;
  onPrev: () => void;
  onSkip: () => void;
  onNext: () => void;
  onFillAll: () => void;
}

function InputFooter({
  currentIndex,
  totalOps,
  onPrev,
  onSkip,
  onNext,
  onFillAll,
}: InputFooterProps) {
  const { colors } = useTheme();
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalOps - 1;

  return (
    <View style={styles.footerRow}>
      {isFirst ? (
        <TouchableOpacity
          style={[styles.footerBtn, styles.footerBtnOutline, { borderColor: colors.border }]}
          onPress={onFillAll}
        >
          <Ionicons name="checkmark-done" size={16} color={colors.primary} />
          <Text style={[styles.footerBtnText, { color: colors.primary }]}>全部完成</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.footerBtn, styles.footerBtnOutline, { borderColor: colors.border }]}
          onPress={onPrev}
        >
          <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
          <Text style={[styles.footerBtnText, { color: colors.textSecondary }]}>上一步</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.footerBtn, styles.footerBtnOutline, { borderColor: colors.border }]}
        onPress={onSkip}
      >
        <Text style={[styles.footerBtnText, { color: colors.textSecondary }]}>跳过</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.footerBtn, styles.footerBtnPrimary, { backgroundColor: colors.primary }]}
        onPress={onNext}
      >
        <Text style={[styles.footerBtnText, { color: colors.textOnPrimary }]}>
          {isLast ? '预览' : '下一步'}
        </Text>
        {!isLast && <Ionicons name="chevron-forward" size={16} color={colors.textOnPrimary} />}
      </TouchableOpacity>
    </View>
  );
}

interface ReviewFooterProps {
  count: number;
  loading: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

function ReviewFooter({ count, loading, onBack, onConfirm }: ReviewFooterProps) {
  const { colors } = useTheme();
  const disabledReason = loading
    ? '正在提交报工，请稍候'
    : count === 0
      ? '请至少填写一条报工数量'
      : undefined;
  const isDisabled = Boolean(disabledReason);

  return (
    <View style={styles.footerRow}>
      <TouchableOpacity
        style={[styles.footerBtn, styles.footerBtnOutline, { borderColor: colors.border }]}
        onPress={onBack}
      >
        <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
        <Text style={[styles.footerBtnText, { color: colors.textSecondary }]}>返回修改</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.footerBtn,
          styles.footerBtnPrimary,
          {
            backgroundColor: isDisabled ? colors.surfaceSecondary : colors.success,
            borderColor: isDisabled ? colors.border : colors.success,
            flex: 2,
          },
          isDisabled && styles.footerBtnDisabled,
        ]}
        onPress={onConfirm}
        disabled={isDisabled}
        accessibilityState={{ disabled: isDisabled }}
        accessibilityHint={disabledReason}
      >
        {loading ? (
          <InlineLoading color={colors.textMuted} />
        ) : (
          <Ionicons
            name="checkmark"
            size={18}
            color={isDisabled ? colors.textMuted : colors.textOnPrimary}
          />
        )}
        <Text
          style={[
            styles.footerBtnText,
            { color: isDisabled ? colors.textMuted : colors.textOnPrimary },
          ]}
        >
          {loading ? '提交中' : count === 0 ? '请先填写报工数量' : `提交全部(${count})`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scheduleSlotCard: {
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  scheduleSlotLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  scheduleSlotValue: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  scheduleSlotMeta: {
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  opInfo: {
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  opInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  seqBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  seqText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  opName: {
    fontSize: FontSize.base,
    fontWeight: '600',
    flex: 1,
  },
  opRemaining: {
    fontSize: FontSize.sm,
    marginLeft: Spacing.sm + Spacing.sm + Spacing.lg, // align with name after seqBadge
  },
  auxiliaryHint: {
    fontSize: FontSize.sm,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  inputSummaryText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  constraintText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  emptyReview: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.base,
  },
  summary: {
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  summaryText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  reviewCardContent: {
    flex: 1,
    gap: 2,
  },
  reviewOpName: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  reviewQty: {
    fontSize: FontSize.sm,
  },
  reviewMeta: {
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  reviewRemark: {
    fontSize: FontSize.xs,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flex: 1,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  footerBtnOutline: {
    borderWidth: 1,
  },
  footerBtnPrimary: {},
  footerBtnDisabled: {
    borderWidth: 1,
  },
  footerBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
