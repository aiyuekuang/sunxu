import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { WorkOrderOperation } from '../../../host/services';
import { EquipmentListDto } from '../../../types/models/EquipmentListDto';
import type { FinishedProductSerialDto } from '../../../types/models/FinishedProductSerialDto';
import { OperationOutputMode } from '../../../types/models/OperationOutputMode';
import { OperationPayMode } from '../../../types/models/OperationPayMode';
import type { OperationPayPreviewDto } from '../../../types/models/OperationPayPreviewDto';
import type { OperationScheduleSlotDto } from '../../../types/models/OperationScheduleSlotDto';
import { ReportOperationDto } from '../../../types/models/ReportOperationDto';
import { TimeCaptureMode } from '../../../types/models/TimeCaptureMode';
import type { WorkOrderDemandAllocationTraceDto } from '../../../types/models/WorkOrderDemandAllocationTraceDto';
import type { Equipment } from '../../../host/services';
import { equipmentService } from '../../../host/services';
import type { EquipmentSession } from '../../../host/services';
import { equipmentSessionService } from '../../../host/services';
import { productSerialService } from '../../../host/services';
import { type ToolingGateDto, toolingService } from '../../../host/services';
import { uploadService } from '../../../host/services';
import { userService } from '../../../host/services';
import type { Warehouse } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { AttachmentFilesField } from '../../../components/common/AttachmentFilesField.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { type ChipOption, ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FormField, FormSwitch } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { PhotoPicker } from '../../../../core/components/PhotoPicker.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { SerialNumbersField } from '../../../components/common/SerialNumbersField.tsx';
import { WarehousePickerField } from '../../../components/common/WarehousePickerField.tsx';
import { P } from '../../../host/authorization';
import { SERIAL_STATUS_LABELS } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';
import { usePermission } from '../../../host/hooks/usePermission';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import {
  type SelectedStockLocation,
  StockLocationField,
} from '../../warehouse/components/StockLocationField.tsx';
import { ReportBatchNoField } from './ReportBatchNoField.tsx';
import { ReportDemandSourceField } from './ReportDemandSourceField.tsx';
import { useScrapPolicyPreview } from '../../../screen-support/work-orders/hooks/useScrapPolicyPreview';
import type { ReportSubmitExtra } from '../../../screen-support/work-orders/hooks/useWorkOrderActions';
import {
  buildOperationReportSummary,
  convertOperationQtyToProductQty,
  convertProductQtyToOperationQty,
  getOperationReportUnit,
} from '../../../screen-support/work-orders/utils/operation-report-conversion';
import {
  formatScheduleSlotLabel,
  formatScheduleSlotSublabel,
} from '../../../screen-support/work-orders/utils/schedule-slot-display';
import { useAuthStore } from '../../../host/state/auth.store';
import { now, parseDate, toDateTimeStr } from '../../../../core/utils/date';
import { formatNumber } from '../../../../core/utils/format';
import { formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';

const EMPTY_DEMAND_ALLOCATIONS: WorkOrderDemandAllocationTraceDto[] = [];

type ReporterOption = {
  id: string;
  username: string;
  realName?: string | null;
};

type ReporterSource =
  | {
      id?: string | null;
      username?: string | null;
      realName?: string | null;
    }
  | null
  | undefined;

type EquipmentAutoFillSource = 'slot' | 'session' | null;

type OperationScheduleSlot = OperationScheduleSlotDto;
type OperationExecutionCapability = {
  canRecord?: boolean | null;
  blockReason?: string | null;
  maxAllowedQty?: number | null;
  reasonRequiredBeyond?: number | null;
  inputScale?: number | null;
  isTerminalOperation?: boolean | null;
};

type OperationWithExecutionCapability = WorkOrderOperation & {
  executionCapability?: OperationExecutionCapability | null;
};

type OperationWithScheduleSlots = OperationWithExecutionCapability & {
  scheduleSlots?: OperationScheduleSlot[];
};

const TIME_SOURCE_OPTIONS: ChipOption[] = [
  { value: ReportOperationDto.timeSource.MANUAL, label: '手工' },
  { value: ReportOperationDto.timeSource.SESSION, label: '上下机' },
  { value: ReportOperationDto.timeSource.IOT, label: '设备采集' },
  { value: ReportOperationDto.timeSource.DERIVED, label: '系统推导' },
];

const EXECUTION_REASON_OPTIONS: ChipOption[] = [
  { value: 'setup', label: '调机' },
  { value: 'mold_change', label: '换模' },
  { value: 'equipment_fault', label: '设备故障' },
  { value: 'material_waiting', label: '等料' },
  { value: 'repair_prepare', label: '返修准备' },
  { value: 'programming', label: '设计/编程' },
  { value: 'handover', label: '清洁/交接' },
  { value: 'other', label: '其他' },
];

// 单次报工工时合理上限：24 小时。超过几乎可判定为跨日未补录/忘记下机等异常数据，
// 需录入端显式确认为跨日/补录并填写说明后再提交（与后端 work-order-report 同源约束）。
const REASONABLE_REPORT_MINUTES_MAX = 24 * 60;

function parseQtyValue(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
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

function formatPayPreviewText(payPreview: unknown): string {
  if (!isOperationPayPreview(payPreview) || payPreview.payMode === 'none') return '';
  if (!payPreview.priceConfigured) {
    return payPreview.message || '未配置工价，报工不受影响，工资待确认';
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

function parseDurationValue(value: string): number | undefined {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.round(parsed);
}

function parseOptionalNonNegativeNumber(value: string): number | undefined | null {
  if (!value.trim()) return undefined;
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function deriveDurationMinutes(startedAt: string, endedAt: string): number | undefined {
  const start = parseDate(startedAt);
  const end = parseDate(endedAt);
  if (!start || !end) return undefined;
  const minutes = end.diff(start, 'minute');
  return minutes > 0 ? minutes : undefined;
}

function normalizeReportTimeSource(value: string): ReportOperationDto.timeSource {
  switch (value) {
    case ReportOperationDto.timeSource.SESSION:
      return ReportOperationDto.timeSource.SESSION;
    case ReportOperationDto.timeSource.IOT:
      return ReportOperationDto.timeSource.IOT;
    case ReportOperationDto.timeSource.DERIVED:
      return ReportOperationDto.timeSource.DERIVED;
    default:
      return ReportOperationDto.timeSource.MANUAL;
  }
}

function getReportScheduleSlots(
  op: OperationWithExecutionCapability | null,
  rootScheduleSlots: OperationScheduleSlot[],
): OperationScheduleSlot[] {
  if (!op) return rootScheduleSlots;
  return ((op as OperationWithScheduleSlots).scheduleSlots ?? []) as OperationScheduleSlot[];
}

function toReporterOption(user: ReporterSource): ReporterOption | null {
  if (!user?.id || !user.username) return null;
  return {
    id: user.id,
    username: user.username,
    realName: user.realName ?? null,
  };
}

function resolveDefaultReporter(
  op: WorkOrderOperation | null,
  currentUser: ReporterSource,
): ReporterOption | null {
  return toReporterOption(op?.assignee) ?? toReporterOption(currentUser);
}

function findSessionMatchedScheduleSlot(
  slots: OperationScheduleSlot[],
  equipmentId?: string | null,
): OperationScheduleSlot | null {
  if (!equipmentId || slots.length <= 1) return null;
  const matches = slots.filter((slot) => slot.equipmentId === equipmentId);
  return matches.length === 1 ? matches[0] : null;
}

function filterEquipmentsForOperation(
  list: Equipment[],
  op: WorkOrderOperation | null,
): Equipment[] {
  let nextList = list;
  if (op?.equipmentType) {
    nextList = nextList.filter((equipment) => equipment.equipmentType === op.equipmentType);
  }
  if (op?.allowedEquipmentIds?.length) {
    const allowedIdSet = new Set(op.allowedEquipmentIds);
    nextList = nextList.filter((equipment) => allowedIdSet.has(equipment.id));
  }
  return nextList;
}

export interface ReportModalProps {
  visible: boolean;
  op: OperationWithExecutionCapability | null;
  workOrderId?: string;
  hasRoute: boolean;
  plannedQty: number;
  /** 工单产品物料ID（报废策略预检维度） */
  materialId?: string | null;
  traceabilityMode?: 'quantity' | 'batch' | 'serial' | null;
  /** 工单客户ID（报废策略预检维度） */
  customerId?: string | null;
  productUnit?: string | null;
  operations?: WorkOrderOperation[];
  demandAllocations?: WorkOrderDemandAllocationTraceDto[];
  scheduleSlots?: OperationScheduleSlot[];
  initialBatchNo?: string;
  currentReceiptWarehouse?: Warehouse | null;
  receiptWarehouseCandidates?: Warehouse[];
  receiptWarehouseLocked?: boolean;
  onClose: () => void;
  onSubmit: (
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
  ) => void | Promise<void>;
  onScanPress: () => void;
}

export function ReportModal({
  visible,
  op,
  workOrderId,
  hasRoute: _hasRoute,
  plannedQty,
  materialId,
  traceabilityMode = 'quantity',
  customerId,
  productUnit,
  demandAllocations = EMPTY_DEMAND_ALLOCATIONS,
  scheduleSlots = [],
  initialBatchNo,
  currentReceiptWarehouse,
  receiptWarehouseCandidates = [],
  receiptWarehouseLocked = false,
  onClose,
  onSubmit,
  onScanPress: _onScanPress,
}: ReportModalProps) {
  const { labelMap: equipmentModelLabelMap } = useDict('equipment_model');
  const {
    options: operationUnitOptions,
    labelMap: operationUnitLabelMap,
    withCurrentOption,
  } = useUnitDisplay('operation');
  const { labelMap: materialUnitLabelMap } = useUnitDisplay('material');
  const { colors } = useTheme();
  const canOverrideReceiptWarehouse = usePermission(P.WORK_ORDER_RECEIPT_OVERRIDE);
  const canReadCurrentEquipmentSession = usePermission(P.EQUIPMENT_SESSION_START);
  const canRequestInspectionGateRelease = usePermission(P.EQUIPMENT_INSPECTION_CREATE);
  const currentUser = useAuthStore((s) => s.user);
  const [completedQty, setCompletedQty] = useState('');
  const [scrappedQty, setScrappedQty] = useState('0');
  const [reportedOperationQty, setReportedOperationQty] = useState('');
  const [reportedOperationScrappedQty, setReportedOperationScrappedQty] = useState('0');
  const [scrapReason, setScrapReason] = useState('');
  const [scrapPhotos, setScrapPhotos] = useState<string[]>([]);
  const [uploadingScrapPhotos, setUploadingScrapPhotos] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inspectionGateBlocked, setInspectionGateBlocked] = useState(false);
  const [inspectionGateSheetVisible, setInspectionGateSheetVisible] = useState(false);
  const [inspectionGateReason, setInspectionGateReason] = useState('');
  const [inspectionGateRequesting, setInspectionGateRequesting] = useState(false);
  const [remark, setRemark] = useState('');
  const [batchNo, setBatchNo] = useState(initialBatchNo ?? '');
  // 生产批号是否必填由后端报工批号候选接口回传，端侧不判断物料追溯模式
  const [batchRequired, setBatchRequired] = useState(false);
  const [batchOptionsLoading, setBatchOptionsLoading] = useState(false);
  const [scrappedSerialNumbersText, setScrappedSerialNumbersText] = useState('');
  const [showScrappedSerialEntry, setShowScrappedSerialEntry] = useState(false);
  const [showAllocatedSerials, setShowAllocatedSerials] = useState(false);
  const [allocatedSerials, setAllocatedSerials] = useState<FinishedProductSerialDto[]>([]);
  const [allocatedSerialsLoading, setAllocatedSerialsLoading] = useState(false);
  const [allocatedSerialsError, setAllocatedSerialsError] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedScheduleSlot, setSelectedScheduleSlot] = useState<OperationScheduleSlot | null>(
    null,
  );
  const [scheduleSlotAutoMatchedByCurrentUser, setScheduleSlotAutoMatchedByCurrentUser] =
    useState(false);
  const [reporter, setReporter] = useState<ReporterOption | null>(null);
  const [selectedDemandLineId, setSelectedDemandLineId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<EquipmentSession | null>(null);
  const [toolingGate, setToolingGate] = useState<ToolingGateDto | null>(null);
  const [toolingGateLoading, setToolingGateLoading] = useState(false);
  const [toolingGateError, setToolingGateError] = useState<string | null>(null);
  const [equipmentAutoFillSource, setEquipmentAutoFillSource] =
    useState<EquipmentAutoFillSource>(null);
  const [isAuxiliary, setIsAuxiliary] = useState(false);
  const [selectedReceiptWarehouse, setSelectedReceiptWarehouse] = useState<Warehouse | null>(null);
  const [receiptWarehouseEditorOpen, setReceiptWarehouseEditorOpen] = useState(false);
  const [selectedReceiptLocation, setSelectedReceiptLocation] =
    useState<SelectedStockLocation | null>(null);
  const [receiptStorageLocation, setReceiptStorageLocation] = useState('');
  const [receiptLocationRequired, setReceiptLocationRequired] = useState(false);
  const [receiptWarehouseChangeReason, setReceiptWarehouseChangeReason] = useState('');
  const [occurredAt, setOccurredAt] = useState(now());
  const [startedAt, setStartedAt] = useState('');
  const [endedAt, setEndedAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [actualSetupMinutes, setActualSetupMinutes] = useState('');
  const [actualSetupMinutesError, setActualSetupMinutesError] = useState('');
  const [abnormalDurationConfirmed, setAbnormalDurationConfirmed] = useState(false);
  const [abnormalDurationNote, setAbnormalDurationNote] = useState('');
  const [timeSource, setTimeSource] = useState<ReportOperationDto.timeSource>(
    ReportOperationDto.timeSource.MANUAL,
  );
  const [zeroQuantityReason, setZeroQuantityReason] = useState('');
  const [executionReason, setExecutionReason] = useState('');
  const [executionQty, setExecutionQty] = useState('');
  const [executionUnit, setExecutionUnit] = useState('');
  const demandSources = useMemo(() => {
    const unique = new Map<string, WorkOrderDemandAllocationTraceDto>();
    for (const allocation of demandAllocations) {
      if (allocation.demandStatus === 'cancelled' || allocation.demandStatus === 'closed') continue;
      unique.set(allocation.demandLineId, allocation);
    }
    return [...unique.values()];
  }, [demandAllocations]);
  const availableScheduleSlots = getReportScheduleSlots(op, scheduleSlots);

  const operationOutputMode = op?.operationOutputMode ?? OperationOutputMode.QUANTITY;
  const payMode = op?.payModeSnapshot ?? OperationPayMode.NONE;
  const timeCaptureMode = op?.timeCaptureMode ?? TimeCaptureMode.MANUAL;
  const isNonOutputExecution = operationOutputMode === OperationOutputMode.NON_OUTPUT_EXECUTION;
  const isExecutionQuantity = operationOutputMode === OperationOutputMode.EXECUTION_QUANTITY;
  const defaultExecutionUnit = isExecutionQuantity ? op?.executionUnit || '次' : '';
  const executionUnitOptions = useMemo(() => {
    const currentUnit = op?.executionUnit?.trim() || defaultExecutionUnit.trim();
    return withCurrentOption(operationUnitOptions, currentUnit);
  }, [defaultExecutionUnit, op?.executionUnit, operationUnitOptions, withCurrentOption]);
  const isExecutionRecord = isNonOutputExecution || isExecutionQuantity;
  const showQuantityFields = !isExecutionRecord;
  const showOperationReportQtyFields =
    showQuantityFields && op?.operationReportAffectsOutput !== false;
  const showTimeFields =
    op != null &&
    (isExecutionRecord ||
      operationOutputMode === OperationOutputMode.QUANTITY_TIME ||
      payMode === OperationPayMode.TIME ||
      timeCaptureMode !== TimeCaptureMode.MANUAL);
  const requiresSession = timeCaptureMode === TimeCaptureMode.SESSION_REQUIRED;
  const requiresDurationForSubmit = isNonOutputExecution;
  // 本次将提交的有效工时：优先手填，其次按开始/结束时间推导（与 handleSubmit 同口径）。
  const resolvedDurationMinutesPreview =
    parseDurationValue(durationMinutes) ?? deriveDurationMinutes(startedAt, endedAt);
  // 工序报工（非执行记录）路径上，单次工时超过合理上限时需异常确认+说明；
  // 执行记录走另一条不带异常确认字段的后端接口，故不在此拦截。
  const isAbnormalDuration =
    showTimeFields &&
    !isExecutionRecord &&
    (resolvedDurationMinutesPreview ?? 0) > REASONABLE_REPORT_MINUTES_MAX;
  const currentOperationSession =
    currentSession &&
    op &&
    ((currentSession.workOrderOpId != null && currentSession.workOrderOpId === op.id) ||
      (currentSession.workOrderOpId == null && currentSession.workOrderId === op.workOrderId))
      ? currentSession
      : null;
  const currentSessionEquipmentId = currentSession?.equipmentId ?? null;
  const executionCapability = op?.executionCapability ?? null;
  const inputScale = executionCapability?.inputScale ?? 4;
  const maxAllowedQty = executionCapability?.maxAllowedQty ?? null;
  const maxQty = op ? Number(maxAllowedQty ?? op.maxReportQty ?? 0) : Number(plannedQty);
  const completedQtyValue = parseQtyValue(completedQty);
  const scrappedQtyValue = parseQtyValue(scrappedQty);
  const reportedOperationQtyValue = parseQtyValue(reportedOperationQty);
  const reportedOperationScrappedQtyValue = parseQtyValue(reportedOperationScrappedQty);
  const convertedCompletedQty =
    op && showOperationReportQtyFields
      ? convertOperationQtyToProductQty(reportedOperationQtyValue, op)
      : completedQtyValue;
  const convertedScrappedQty =
    op && showOperationReportQtyFields
      ? convertOperationQtyToProductQty(reportedOperationScrappedQtyValue, op)
      : scrappedQtyValue;
  // 报废策略实时预检（与后端报工拦截同源）：命中要求照片时在提交前驱动必填与提示
  const scrapPolicyPreview = useScrapPolicyPreview({
    enabled: visible && !isExecutionRecord,
    materialId,
    customerId,
    operationId: op?.id ?? null,
    processOperationId: op?.processOperationId ?? null,
    scrapReason: scrapReason.trim() || null,
    completedQty: convertedCompletedQty,
    scrappedQty: convertedScrappedQty,
    plannedQty,
  });
  const scrapPhotoRequired = Boolean(scrapPolicyPreview?.requiresPhoto);
  const productUnitLabel = formatUnitLabel(productUnit, materialUnitLabelMap);
  const hasDedicatedOperationUnit = Boolean(op?.operationReportUnit?.trim());
  const operationReportUnit = formatUnitLabel(
    op ? getOperationReportUnit(op, productUnit) : '工序单位',
    hasDedicatedOperationUnit ? operationUnitLabelMap : materialUnitLabelMap,
  );
  const operationReportSummary = op
    ? buildOperationReportSummary({ ...op, operationReportUnit }, productUnitLabel)
    : null;
  const executionUnitDisplay = formatUnitLabel(
    executionUnit || defaultExecutionUnit,
    operationUnitLabelMap,
  );
  const operationReportTotalQty = reportedOperationQtyValue + reportedOperationScrappedQtyValue;
  const operationReportMaxQty =
    op && showOperationReportQtyFields ? convertProductQtyToOperationQty(maxQty, op) : undefined;
  const operationReportRemainingAfter =
    operationReportMaxQty != null
      ? Math.max(0, operationReportMaxQty - operationReportTotalQty)
      : undefined;
  const executionQtyValue = parseQtyValue(executionQty);
  const executionQtyMax = isExecutionQuantity ? maxAllowedQty : null;
  const requiresExecutionReason =
    isNonOutputExecution ||
    (isExecutionQuantity &&
      executionCapability?.reasonRequiredBeyond != null &&
      executionQtyValue > executionCapability.reasonRequiredBeyond + 0.0001);
  const totalQty = convertedCompletedQty + convertedScrappedQty;
  const remainingAfterReport = Math.max(0, maxQty - totalQty);
  const formatReportQty = (value: number) =>
    formatNumber(value, { fallback: '0', maximumFractionDigits: 4 });
  const completedMax = Math.max(0, maxQty - scrappedQtyValue);
  const scrappedMax = Math.max(0, maxQty - completedQtyValue);
  const upstreamHint = op?.reportBlockReason ?? undefined;
  const outputLimitHint =
    upstreamHint && maxQty <= 0
      ? upstreamHint
      : `当前最多可报 ${formatReportQty(maxQty)}。如实际多做成品，请先追加投产或补加工单；如果只是加工次数，请记录执行量。`;
  const completedQtyError =
    showQuantityFields && completedQtyValue > completedMax ? outputLimitHint : undefined;
  const scrappedQtyError =
    showQuantityFields && scrappedQtyValue > scrappedMax ? outputLimitHint : undefined;
  const allowZeroQuantity = showQuantityFields && op?.allowZeroQuantityReport === true;
  const isFinalReport = executionCapability?.isTerminalOperation === true;
  const needsProductSerials =
    traceabilityMode === 'serial' && (!op || isFinalReport) && showQuantityFields;
  const showReceiptWarehouseSection = isFinalReport && showQuantityFields;
  const showReceiptWarehouseOverride =
    canOverrideReceiptWarehouse && isFinalReport && showQuantityFields;
  const currentReceiptWarehouseName = currentReceiptWarehouse?.name ?? '-';
  const effectiveReceiptWarehouseId = showReceiptWarehouseSection
    ? selectedReceiptWarehouse?.id || currentReceiptWarehouse?.id
    : undefined;
  const payPreviewText = formatPayPreviewText(op?.payPreview);
  const executionBlockReason =
    executionCapability?.canRecord === false
      ? (executionCapability.blockReason ?? '当前工序暂不可录入执行')
      : null;
  const autoBoundScheduleSlot =
    availableScheduleSlots.length === 1 ? availableScheduleSlots[0] : null;
  useEffect(() => {
    if (visible) {
      setInspectionGateBlocked(false);
      setInspectionGateSheetVisible(false);
      setInspectionGateReason('');
      setReceiptWarehouseEditorOpen(false);
      setSelectedReceiptWarehouse(null);
      setReceiptWarehouseChangeReason('');
      // 生产批号必填以后端候选接口本次返回为准，打开弹窗时先复位
      setBatchRequired(false);
      setReporter(resolveDefaultReporter(op, currentUser));
      setSelectedScheduleSlot(autoBoundScheduleSlot);
      setScheduleSlotAutoMatchedByCurrentUser(false);
      setEquipmentAutoFillSource(null);
      setOccurredAt(now());
      setStartedAt('');
      setEndedAt('');
      setDurationMinutes('');
      setActualSetupMinutes('');
      setActualSetupMinutesError('');
      setAbnormalDurationConfirmed(false);
      setAbnormalDurationNote('');
      setTimeSource(ReportOperationDto.timeSource.MANUAL);
      setZeroQuantityReason('');
      setExecutionReason('');
      setExecutionQty('');
      setExecutionUnit(defaultExecutionUnit);
      setReportedOperationQty('');
      setReportedOperationScrappedQty('0');
      setSelectedDemandLineId(null);
      setToolingGate(null);
      setToolingGateError(null);
      setSelectedReceiptLocation(null);
      setReceiptStorageLocation('');
      setReceiptLocationRequired(false);
    }
    if (!visible) {
      setInspectionGateBlocked(false);
      setInspectionGateSheetVisible(false);
      setInspectionGateReason('');
      setScrappedSerialNumbersText('');
      setShowScrappedSerialEntry(false);
      setShowAllocatedSerials(false);
      setAllocatedSerials([]);
      setAllocatedSerialsError('');
      setScrapPhotos([]);
      setPhotos([]);
      setSelectedEquipment(null);
      setSelectedScheduleSlot(null);
      setScheduleSlotAutoMatchedByCurrentUser(false);
      setReporter(null);
      setCurrentSession(null);
      setEquipmentAutoFillSource(null);
      setIsAuxiliary(false);
      setSelectedReceiptWarehouse(null);
      setReceiptWarehouseEditorOpen(false);
      setSelectedReceiptLocation(null);
      setReceiptStorageLocation('');
      setReceiptLocationRequired(false);
      setReceiptWarehouseChangeReason('');
      setOccurredAt(now());
      setStartedAt('');
      setEndedAt('');
      setDurationMinutes('');
      setActualSetupMinutes('');
      setActualSetupMinutesError('');
      setAbnormalDurationConfirmed(false);
      setAbnormalDurationNote('');
      setTimeSource(ReportOperationDto.timeSource.MANUAL);
      setZeroQuantityReason('');
      setExecutionReason('');
      setExecutionQty('');
      setExecutionUnit('');
      setReportedOperationQty('');
      setReportedOperationScrappedQty('0');
      setSelectedDemandLineId(null);
      setToolingGate(null);
      setToolingGateError(null);
    }
  }, [visible, currentUser, op, autoBoundScheduleSlot, defaultExecutionUnit]);

  useEffect(() => {
    let cancelled = false;
    if (!visible || !currentUser?.id || !canReadCurrentEquipmentSession) {
      setCurrentSession(null);
      return () => {
        cancelled = true;
      };
    }

    void equipmentSessionService
      .myCurrent()
      .then((session) => {
        if (cancelled) return;
        setCurrentSession(session ?? null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.warn('Failed to preload current equipment session for report modal', error);
        setCurrentSession(null);
      });

    return () => {
      cancelled = true;
    };
  }, [canReadCurrentEquipmentSession, visible, currentUser?.id]);

  useEffect(() => {
    let cancelled = false;
    if (!visible || !op?.id) {
      setToolingGate(null);
      setToolingGateError(null);
      setToolingGateLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setToolingGateLoading(true);
    setToolingGateError(null);
    void toolingService
      .recommendForOperation({
        workOrderOpId: op.id,
        equipmentId: selectedEquipment?.id ?? op.equipmentId ?? undefined,
      })
      .then((gate) => {
        if (cancelled) return;
        setToolingGate(gate);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setToolingGate(null);
        setToolingGateError(error instanceof Error ? error.message : '工装预检读取失败');
      })
      .finally(() => {
        if (cancelled) return;
        setToolingGateLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, op?.id, op?.equipmentId, selectedEquipment?.id]);

  useEffect(() => {
    if (!visible || !showTimeFields || !currentOperationSession) return;
    if (!reporter?.id || reporter.id !== currentUser?.id) return;
    setTimeSource(ReportOperationDto.timeSource.SESSION);
    setStartedAt((prev) => prev || toDateTimeStr(currentOperationSession.startedAt));
    setEndedAt((prev) => prev || now());
    const sessionDuration =
      currentOperationSession.actualDuration ??
      deriveDurationMinutes(toDateTimeStr(currentOperationSession.startedAt), now());
    if (sessionDuration != null && sessionDuration > 0) {
      setDurationMinutes((prev) => prev || String(sessionDuration));
    }
  }, [visible, showTimeFields, currentOperationSession, reporter?.id, currentUser?.id]);

  useEffect(() => {
    if (!visible || !showTimeFields) return;
    if (timeSource === ReportOperationDto.timeSource.MANUAL) return;
    const derivedMinutes = deriveDurationMinutes(startedAt, endedAt);
    if (derivedMinutes != null) {
      setDurationMinutes(String(derivedMinutes));
    }
  }, [visible, showTimeFields, startedAt, endedAt, timeSource]);

  useEffect(() => {
    if (!visible || selectedScheduleSlot || availableScheduleSlots.length <= 1) return;
    if (!reporter?.id || reporter.id !== currentUser?.id) return;
    const matchedSlot = findSessionMatchedScheduleSlot(
      availableScheduleSlots,
      currentSessionEquipmentId,
    );
    if (matchedSlot) {
      setSelectedScheduleSlot(matchedSlot);
      setScheduleSlotAutoMatchedByCurrentUser(true);
    }
  }, [
    visible,
    selectedScheduleSlot,
    availableScheduleSlots,
    reporter?.id,
    currentUser?.id,
    currentSessionEquipmentId,
  ]);

  useEffect(() => {
    if (!visible) return;
    if (!reporter?.id || reporter.id === currentUser?.id) return;
    if (scheduleSlotAutoMatchedByCurrentUser) {
      setSelectedScheduleSlot(null);
      setScheduleSlotAutoMatchedByCurrentUser(false);
    }
    if (
      equipmentAutoFillSource === 'session' &&
      selectedEquipment?.id &&
      selectedEquipment.id === currentSessionEquipmentId
    ) {
      setSelectedEquipment(null);
      setEquipmentAutoFillSource(null);
    }
  }, [
    visible,
    reporter?.id,
    currentUser?.id,
    currentSessionEquipmentId,
    scheduleSlotAutoMatchedByCurrentUser,
    selectedEquipment?.id,
    equipmentAutoFillSource,
  ]);

  useEffect(() => {
    if (!visible || equipmentAutoFillSource !== 'slot' || !selectedEquipment?.id) return;
    if (selectedScheduleSlot?.equipmentId || autoBoundScheduleSlot?.equipmentId) return;
    setSelectedEquipment(null);
    setEquipmentAutoFillSource(null);
  }, [
    visible,
    equipmentAutoFillSource,
    selectedEquipment?.id,
    selectedScheduleSlot?.equipmentId,
    autoBoundScheduleSlot?.equipmentId,
  ]);

  useEffect(() => {
    const preferredEquipmentSource =
      selectedScheduleSlot?.equipmentId || autoBoundScheduleSlot?.equipmentId
        ? 'slot'
        : reporter?.id === currentUser?.id && currentSessionEquipmentId
          ? 'session'
          : null;
    const preferredEquipmentId =
      selectedScheduleSlot?.equipmentId ??
      autoBoundScheduleSlot?.equipmentId ??
      (reporter?.id === currentUser?.id ? currentSessionEquipmentId : null);
    if (!visible || !preferredEquipmentId) return;
    if (selectedEquipment?.id === preferredEquipmentId) return;
    if (
      selectedEquipment &&
      !selectedScheduleSlot?.equipmentId &&
      !autoBoundScheduleSlot?.equipmentId
    ) {
      return;
    }

    let cancelled = false;
    const pageSize = op?.allowedEquipmentIds?.length
      ? Math.max(50, op.allowedEquipmentIds.length)
      : 50;

    void equipmentService
      .list({
        page: 1,
        pageSize,
        equipmentType: op?.equipmentType ?? undefined,
        statuses: [EquipmentListDto.status.ACTIVE, EquipmentListDto.status.OCCUPIED],
      })
      .then((result) => {
        if (cancelled) return;
        const matched = filterEquipmentsForOperation(result.list, op).find(
          (equipment) => equipment.id === preferredEquipmentId,
        );
        if (matched) {
          setSelectedEquipment(matched);
          setEquipmentAutoFillSource(preferredEquipmentSource);
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.warn('Failed to preload preferred equipment for report modal', error);
      });

    return () => {
      cancelled = true;
    };
  }, [
    visible,
    selectedScheduleSlot,
    autoBoundScheduleSlot,
    reporter?.id,
    currentUser?.id,
    currentSessionEquipmentId,
    selectedEquipment,
    op,
  ]);

  useEffect(() => {
    if (initialBatchNo) setBatchNo(initialBatchNo);
  }, [initialBatchNo]);

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
      ? availableScheduleSlots.filter((slot) => {
          const label = formatScheduleSlotLabel(slot).toLowerCase();
          const sublabel = formatScheduleSlotSublabel(slot).toLowerCase();
          return label.includes(normalizedKeyword) || sublabel.includes(normalizedKeyword);
        })
      : availableScheduleSlots;
    const start = (page - 1) * pageSize;
    return {
      list: filtered.slice(start, start + pageSize),
      total: filtered.length,
    };
  };

  const handleSubmit = async () => {
    if (batchOptionsLoading) {
      toast.info('正在读取生产批号规则，请稍后提交');
      return;
    }
    const parsedActualSetupMinutes = parseOptionalNonNegativeNumber(actualSetupMinutes);
    if (parsedActualSetupMinutes === null) {
      setActualSetupMinutesError('请输入不小于 0 的分钟数');
      toast.info('实测准备/换型工时必须是不小于 0 的数字');
      return;
    }
    setActualSetupMinutesError('');
    const qty = convertedCompletedQty;
    const scrapQty = convertedScrappedQty;
    const resolvedDurationMinutes =
      parseDurationValue(durationMinutes) ?? deriveDurationMinutes(startedAt, endedAt);
    const trimmedZeroQuantityReason = zeroQuantityReason.trim() || undefined;
    const trimmedExecutionReason = executionReason.trim() || undefined;
    const trimmedExecutionUnit = executionUnit.trim() || defaultExecutionUnit || undefined;

    if (executionBlockReason) {
      toast.info(executionBlockReason);
      return;
    }

    if (requiresSession && !currentOperationSession?.id) {
      toast.info('当前工序要求先上机，请先完成上机后再提交');
      return;
    }

    if (isExecutionRecord) {
      if (!op?.id) {
        toast.info('请选择要记录执行的工序');
        return;
      }
      if (requiresExecutionReason && !trimmedExecutionReason && !remark.trim()) {
        toast.info(
          isExecutionQuantity ? '执行量超过目标时请填写执行原因或备注' : '请填写执行原因或备注',
        );
        return;
      }
      if (isExecutionQuantity) {
        if (executionQtyValue <= 0) {
          toast.info('请填写本次执行量');
          return;
        }
        if (executionQtyMax != null && executionQtyValue > executionQtyMax) {
          toast.info(`本次执行量最多可录入 ${formatReportQty(executionQtyMax)}`);
          return;
        }
        if (!trimmedExecutionUnit) {
          toast.info('请填写执行单位');
          return;
        }
      }
      if (isNonOutputExecution && (!resolvedDurationMinutes || resolvedDurationMinutes <= 0)) {
        toast.info('请填写有效工时，或选择开始和结束时间');
        return;
      }
    } else {
      if (qty + scrapQty <= 0 && !allowZeroQuantity) {
        toast.info('请至少填写良品数量或报废数量');
        return;
      }
      if (qty + scrapQty <= 0 && allowZeroQuantity && !trimmedZeroQuantityReason) {
        toast.info('零数量报工必须选择原因');
        return;
      }
      if (qty + scrapQty > maxQty) {
        toast.info(outputLimitHint);
        return;
      }
      if (needsProductSerials && scrapQty > 0) {
        const parseSerialNumbers = (value: string) =>
          value
            .split(/[\n,，;；\t ]+/)
            .map((item) => item.trim())
            .filter(Boolean);
        const scrapSerials = parseSerialNumbers(scrappedSerialNumbersText);
        if (!Number.isSafeInteger(scrapQty) || scrapSerials.length > scrapQty) {
          toast.info('已登记的报废序列号不能超过本次报废数量');
          return;
        }
        if (new Set(scrapSerials).size !== scrapSerials.length) {
          toast.info('报废序列号不能重复');
          return;
        }
      }
      if (qty + scrapQty > 0 && demandSources.length > 1 && !selectedDemandLineId) {
        toast.info('请选择本次报工对应的来源订单');
        return;
      }
      // 生产批号是否必填由后端候选接口的 batchRequired 决定（按批号/序列号追溯的工单）
      if (batchRequired && !batchNo.trim()) {
        toast.info('请选择或新建本次报工的生产批号');
        return;
      }
    }

    if (
      showTimeFields &&
      requiresDurationForSubmit &&
      (!resolvedDurationMinutes || resolvedDurationMinutes <= 0)
    ) {
      toast.info('当前工序需要确认工时，请填写有效工时');
      return;
    }

    if (isAbnormalDuration) {
      if (!abnormalDurationConfirmed) {
        toast.info('本次工时超过 24 小时，若为跨日或补录请确认并说明');
        return;
      }
      if (!abnormalDurationNote.trim()) {
        toast.info('请填写跨日/补录工时说明');
        return;
      }
    }

    const trimmedScrapReason = scrapReason.trim() || undefined;
    if (!isExecutionRecord && scrapQty > 0 && !trimmedScrapReason) {
      toast.info('有报废数量时必须填写报废原因');
      return;
    }
    // 命中报废策略要求照片时，提交前前端即拦截（与后端 blocking 同源），避免白填一单被打回
    if (!isExecutionRecord && scrapQty > 0 && scrapPhotoRequired && scrapPhotos.length === 0) {
      toast.info(
        scrapPolicyPreview?.actionMessage
          ? `${scrapPolicyPreview.actionMessage}，请先上传报废照片再提交`
          : '当前报废策略要求上传报废照片',
      );
      return;
    }
    const overrideReceiptWarehouseId =
      selectedReceiptWarehouse?.id && selectedReceiptWarehouse.id !== currentReceiptWarehouse?.id
        ? selectedReceiptWarehouse.id
        : undefined;
    const trimmedReceiptWarehouseChangeReason = receiptWarehouseChangeReason.trim() || undefined;
    if (trimmedReceiptWarehouseChangeReason && !overrideReceiptWarehouseId) {
      toast.info('选择新入库仓后再填写改仓原因');
      return;
    }
    if (overrideReceiptWarehouseId && !trimmedReceiptWarehouseChangeReason) {
      toast.info('改入库仓时必须填写变更原因');
      return;
    }
    if (
      !isExecutionRecord &&
      showReceiptWarehouseSection &&
      receiptLocationRequired &&
      !selectedReceiptLocation
    ) {
      toast.info('当前入库仓要求选择仓位');
      return;
    }
    const resolvedScheduleSlot = selectedScheduleSlot ?? autoBoundScheduleSlot;
    if (availableScheduleSlots.length > 1 && !resolvedScheduleSlot) {
      toast.info('当前存在多条排产实例，请先选择具体设备/时间段');
      return;
    }
    const scheduleEntryId =
      availableScheduleSlots.length > 1 ? resolvedScheduleSlot?.id : undefined;
    // 如果选择的报工人和当前用户不同，传 reporterId；否则由后端按工序指定人员优先兜底
    const reporterId =
      reporter && currentUser && reporter.id !== currentUser.id ? reporter.id : undefined;
    setUploadingScrapPhotos(true);
    setUploadingPhotos(true);
    let scrapPhotoUrls: string[] | undefined;
    let photoUrls: string[] | undefined;
    try {
      const [uploadedScrapUrls, uploadedPhotoUrls] = await Promise.all([
        !isExecutionRecord && scrapQty > 0
          ? uploadService.uploadImages(scrapPhotos)
          : Promise.resolve([]),
        !isExecutionRecord && photos.length > 0
          ? uploadService.uploadImages(photos)
          : Promise.resolve([]),
      ]);
      scrapPhotoUrls = uploadedScrapUrls.length > 0 ? uploadedScrapUrls : undefined;
      photoUrls = uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : undefined;
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '照片上传失败');
      return;
    } finally {
      setUploadingScrapPhotos(false);
      setUploadingPhotos(false);
    }
    const receiptLocationExtra:
      | Pick<ReportSubmitExtra, 'receiptLocationId' | 'storageLocation'>
      | undefined =
      !isExecutionRecord && selectedReceiptLocation
        ? {
            receiptLocationId: selectedReceiptLocation.id,
            storageLocation: selectedReceiptLocation.pathName,
          }
        : !isExecutionRecord && receiptStorageLocation.trim()
          ? {
              storageLocation: receiptStorageLocation.trim(),
            }
          : undefined;
    const extra: ReportSubmitExtra | undefined = op
      ? {
          isExecutionRecord,
          isNonOutputExecution,
          isExecutionQuantity,
          executionQty: isExecutionQuantity ? executionQtyValue : undefined,
          executionUnit: isExecutionQuantity ? trimmedExecutionUnit : undefined,
          durationMinutes: showTimeFields ? resolvedDurationMinutes : undefined,
          actualSetupMinutes: parsedActualSetupMinutes,
          equipmentSessionId: currentOperationSession?.id,
          startedAt: showTimeFields ? startedAt || undefined : undefined,
          endedAt: showTimeFields ? endedAt || undefined : undefined,
          timeSource: showTimeFields ? timeSource : undefined,
          abnormalDurationConfirmed: isAbnormalDuration ? abnormalDurationConfirmed : undefined,
          abnormalDurationNote: isAbnormalDuration
            ? abnormalDurationNote.trim() || undefined
            : undefined,
          workCenterId: op.workCenterId ?? undefined,
          zeroQuantityReason: trimmedZeroQuantityReason,
          executionReason: trimmedExecutionReason,
          reportedOperationQty: showOperationReportQtyFields
            ? reportedOperationQtyValue
            : undefined,
          reportedOperationScrappedQty: showOperationReportQtyFields
            ? reportedOperationScrappedQtyValue
            : undefined,
          scrappedSerialNumbers:
            needsProductSerials && scrapQty > 0
              ? scrappedSerialNumbersText
                  .split(/[\n,，;；\t ]+/)
                  .map((item) => item.trim())
                  .filter(Boolean)
              : undefined,
          demandLineId:
            selectedDemandLineId ||
            (demandSources.length === 1 ? demandSources[0].demandLineId : undefined),
          ...receiptLocationExtra,
        }
      : {
          ...receiptLocationExtra,
          scrappedSerialNumbers:
            needsProductSerials && scrapQty > 0
              ? scrappedSerialNumbersText
                  .split(/[\n,，;；\t ]+/)
                  .map((item) => item.trim())
                  .filter(Boolean)
              : undefined,
          demandLineId:
            selectedDemandLineId ||
            (demandSources.length === 1 ? demandSources[0].demandLineId : undefined),
        };
    setSubmitting(true);
    try {
      await onSubmit(
        qty,
        scrapQty,
        remark,
        op?.id,
        scheduleEntryId,
        batchNo || undefined,
        selectedEquipment?.id || undefined,
        reporterId,
        isAuxiliary || undefined,
        overrideReceiptWarehouseId,
        trimmedReceiptWarehouseChangeReason,
        occurredAt || undefined,
        trimmedScrapReason,
        scrapPhotoUrls,
        photoUrls,
        extra,
      );
    } catch (error) {
      // 提交失败：hook 已弹出错误提示。保留本次填写内容（含报废数量/原因/已选照片），
      // 便于用户补填（如补传报废照片）后直接重新提交，不必重头再填一遍。
      const err = error as Error & { response?: { data?: { message?: string | string[] } } };
      const errorMessage = err.response?.data?.message ?? err.message ?? '';
      const normalizedMessage = Array.isArray(errorMessage) ? errorMessage.join(' ') : errorMessage;
      if (
        normalizedMessage.includes('当日首个工单报工') &&
        normalizedMessage.includes('主管放行')
      ) {
        setInspectionGateBlocked(true);
      }
      return;
    } finally {
      setSubmitting(false);
    }
    // 仅在提交成功后才重置表单
    setCompletedQty('');
    setScrappedQty('0');
    setScrapReason('');
    setScrapPhotos([]);
    setPhotos([]);
    setRemark('');
    setBatchNo('');
    setScrappedSerialNumbersText('');
    setShowScrappedSerialEntry(false);
    setStartedAt('');
    setEndedAt('');
    setDurationMinutes('');
    setActualSetupMinutes('');
    setActualSetupMinutesError('');
    setAbnormalDurationConfirmed(false);
    setAbnormalDurationNote('');
    setTimeSource(ReportOperationDto.timeSource.MANUAL);
    setZeroQuantityReason('');
    setExecutionReason('');
    setExecutionQty('');
    setExecutionUnit(defaultExecutionUnit);
    setReportedOperationQty('');
    setReportedOperationScrappedQty('0');
    setSelectedEquipment(null);
    setSelectedScheduleSlot(null);
    setReporter(null);
    setIsAuxiliary(false);
    setSelectedReceiptWarehouse(null);
    setSelectedReceiptLocation(null);
    setReceiptStorageLocation('');
    setReceiptLocationRequired(false);
    setReceiptWarehouseChangeReason('');
    setOccurredAt(now());
  };

  const handleReporterChange = (nextReporter: ReporterOption | null) => {
    setReporter(nextReporter);
  };

  const handleScheduleSlotChange = (slot: OperationScheduleSlot | null) => {
    setScheduleSlotAutoMatchedByCurrentUser(false);
    setInspectionGateBlocked(false);
    setSelectedScheduleSlot(slot);
  };

  const handleEquipmentChange = (equipment: Equipment | null) => {
    setEquipmentAutoFillSource(null);
    setInspectionGateBlocked(false);
    setSelectedEquipment(equipment);
  };

  const inspectionGateEquipmentId =
    selectedEquipment?.id || selectedScheduleSlot?.equipmentId || op?.equipmentId;

  const requestInspectionGateRelease = async () => {
    const targetWorkOrderId = op?.workOrderId ?? workOrderId;
    const targetEquipmentId = inspectionGateEquipmentId;
    const reason = inspectionGateReason.trim();
    if (!targetWorkOrderId || !targetEquipmentId || reason.length < 3) {
      toast.info('请确认工单、设备并填写至少 3 个字的放行原因');
      return;
    }
    setInspectionGateRequesting(true);
    try {
      await equipmentService.createInspectionGateRelease({
        equipmentId: targetEquipmentId,
        workOrderId: targetWorkOrderId,
        reason,
      });
      setInspectionGateSheetVisible(false);
      setInspectionGateReason('');
      toast.success('放行申请已提交，请等待主管审批');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '放行申请提交失败');
    } finally {
      setInspectionGateRequesting(false);
    }
  };

  const handleAllocatedSerialsToggle = async () => {
    if (showAllocatedSerials) {
      setShowAllocatedSerials(false);
      return;
    }
    setShowAllocatedSerials(true);
    setAllocatedSerialsError('');
    const targetWorkOrderId = op?.workOrderId ?? workOrderId;
    if (!targetWorkOrderId) return;
    setAllocatedSerialsLoading(true);
    try {
      const serials = await productSerialService.listForWorkOrder(targetWorkOrderId);
      setAllocatedSerials(serials);
    } catch {
      setAllocatedSerialsError('读取工单已分配序列号失败，请稍后重试。');
    } finally {
      setAllocatedSerialsLoading(false);
    }
  };

  return (
    <>
      <FullScreenModal
        visible={visible}
        onClose={onClose}
        title={
          op
            ? `${isExecutionQuantity ? '记录执行量' : isNonOutputExecution ? '记录执行' : '工序报工'}：${op.operationName}`
            : '整单报工'
        }
        confirmText={
          isExecutionQuantity ? '保存执行量' : isNonOutputExecution ? '保存执行记录' : '提交报工'
        }
        onConfirm={handleSubmit}
        loading={uploadingScrapPhotos || uploadingPhotos || submitting}
        disabled={
          uploadingScrapPhotos ||
          uploadingPhotos ||
          submitting ||
          batchOptionsLoading ||
          executionBlockReason !== null
        }
        avoidKeyboard
      >
        {op?.assignee && <AssigneeBanner assignee={op.assignee} />}
        {executionBlockReason ? (
          <Text style={[styles.constraintText, { color: colors.error }]}>
            {executionBlockReason}
          </Text>
        ) : null}
        {inspectionGateBlocked &&
        canRequestInspectionGateRelease &&
        inspectionGateEquipmentId &&
        (op?.workOrderId || workOrderId) ? (
          <View
            style={[
              styles.inspectionGateCard,
              { borderColor: colors.warning, backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Text style={[styles.constraintText, { color: colors.text }]}>
              设备上班点检未完成，当前工单报工被暂时拦截。可先完成点检，或提交一次性主管放行申请；放行不会补写点检记录。
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setInspectionGateSheetVisible(true)}
              style={[styles.inspectionGateButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.inspectionGateButtonText, { color: colors.textOnPrimary }]}>
                申请主管放行
              </Text>
            </Pressable>
          </View>
        ) : null}
        {payPreviewText ? (
          <Text style={[styles.payPreviewText, { color: colors.textSecondary }]}>
            工价：{payPreviewText}
          </Text>
        ) : null}
        {op && showOperationReportQtyFields ? (
          <View style={[styles.operationReportCard, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.operationReportTitle, { color: colors.text }]}>
              {operationReportSummary}
            </Text>
            <Text style={[styles.operationReportMeta, { color: colors.textSecondary }]}>
              {op.operationReportTargetQtySnapshot !== null &&
              op.operationReportTargetQtySnapshot !== undefined
                ? `目标 ${op.operationReportTargetQtySnapshot} ${operationReportUnit}，已报 ${
                    op.operationReportReportedQty ?? 0
                  } ${operationReportUnit}，剩余 ${
                    op.operationReportRemainingQty ?? operationReportMaxQty ?? '—'
                  } ${operationReportUnit}`
                : `已报 ${op.operationReportReportedQty ?? 0} ${operationReportUnit}`}
            </Text>
          </View>
        ) : null}
        {op ? (
          <ToolingGatePanel
            gate={toolingGate}
            loading={toolingGateLoading}
            error={toolingGateError}
          />
        ) : null}
        {!isExecutionRecord ? (
          <ReportDemandSourceField
            allocations={demandSources}
            value={selectedDemandLineId}
            onChange={setSelectedDemandLineId}
          />
        ) : null}
        <EntityPickerField<{ id: string; username: string; realName?: string | null }>
          label="报工人"
          value={reporter}
          onChange={handleReporterChange}
          fetchFn={userService.listForPicker}
          keyExtractor={(u) => u.id}
          labelExtractor={(u) => u.realName || u.username}
          sublabelExtractor={(u) => (u.realName ? u.username : '')}
          title="选择报工人"
          placeholder="工序指定人员优先，未指定则默认当前用户"
        />
        {op != null &&
          showQuantityFields &&
          op.auxiliaryPriceRatioSnapshot != null &&
          op.auxiliaryPriceRatioSnapshot > 0 && (
            <>
              <FormSwitch label="辅操报工" value={isAuxiliary} onValueChange={setIsAuxiliary} />
              {isAuxiliary && op.auxiliaryPriceRatioSnapshot != null && (
                <Text style={[styles.auxiliaryHint, { color: colors.textSecondary }]}>
                  辅操比例：{Math.round(Number(op.auxiliaryPriceRatioSnapshot) * 100)}%
                </Text>
              )}
            </>
          )}
        <Text style={[styles.summary, { color: colors.textSecondary }]}>
          {isExecutionRecord
            ? isExecutionQuantity
              ? '本次只记录执行量，不增加良品进度，不触发入库和质检。'
              : '本次只记录执行工时，不增加良品进度，不触发入库和质检。'
            : showOperationReportQtyFields
              ? `本次报 ${formatReportQty(operationReportTotalQty)} ${operationReportUnit}，折算产品 ${formatReportQty(totalQty)} ${productUnitLabel}，产品剩余 ${formatReportQty(remainingAfterReport)}${productUnitLabel}${
                  operationReportRemainingAfter !== undefined
                    ? `，工序剩余 ${formatReportQty(operationReportRemainingAfter)}${operationReportUnit}`
                    : ''
                }。`
              : `本次合计 ${formatReportQty(totalQty)}，报后剩余 ${formatReportQty(remainingAfterReport)}。报废会占用本次可报数量，不会流转到下道工序。`}
        </Text>
        {upstreamHint ? (
          <Text style={[styles.constraintText, { color: colors.warning }]}>{upstreamHint}</Text>
        ) : null}
        <DatePickerField
          label="实际发生时间"
          value={occurredAt}
          onChange={setOccurredAt}
          mode="datetime"
          showCurrentShortcut
          clearable={false}
        />
        {availableScheduleSlots.length > 1 ? (
          <>
            <EntityPickerField<OperationScheduleSlot>
              label="排产实例"
              value={selectedScheduleSlot}
              onChange={handleScheduleSlotChange}
              fetchFn={localScheduleSlotFetch}
              keyExtractor={(slot) => slot.id}
              labelExtractor={formatScheduleSlotLabel}
              sublabelExtractor={formatScheduleSlotSublabel}
              title="选择排产实例"
              placeholder="请选择设备/时间段"
              clearable={false}
            />
            <Text style={[styles.constraintText, { color: colors.warning }]}>
              同一工序存在多条排产实例，报工时必须明确绑定具体设备/时间段。
            </Text>
          </>
        ) : autoBoundScheduleSlot ? (
          <View style={[styles.scheduleSlotCard, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.scheduleSlotLabel, { color: colors.textSecondary }]}>
              已自动绑定排产实例
            </Text>
            <Text style={[styles.scheduleSlotValue, { color: colors.text }]}>
              {formatScheduleSlotLabel(autoBoundScheduleSlot)}
            </Text>
            {formatScheduleSlotSublabel(autoBoundScheduleSlot) ? (
              <Text style={[styles.scheduleSlotMeta, { color: colors.textSecondary }]}>
                {formatScheduleSlotSublabel(autoBoundScheduleSlot)}
              </Text>
            ) : null}
          </View>
        ) : null}
        {showTimeFields ? (
          <>
            {requiresSession && !currentOperationSession ? (
              <Text style={[styles.constraintText, { color: colors.warning }]}>
                当前工序要求先上机，未检测到与本工序匹配的运行中上机会话。
              </Text>
            ) : currentOperationSession ? (
              <View style={[styles.timeSessionCard, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.timeSessionLabel, { color: colors.textSecondary }]}>
                  已关联当前上机会话
                </Text>
                <Text style={[styles.timeSessionValue, { color: colors.text }]}>
                  {currentOperationSession.equipment?.name ?? selectedEquipment?.name ?? '当前设备'}
                </Text>
              </View>
            ) : null}
            <ChipSelectField
              label="工时来源"
              options={TIME_SOURCE_OPTIONS}
              value={timeSource}
              onChange={(value) => setTimeSource(normalizeReportTimeSource(value))}
              overflow="scroll"
            />
            <DatePickerField
              label="开始时间"
              value={startedAt}
              onChange={setStartedAt}
              mode="datetime"
              showCurrentShortcut
              placeholder="可选，选择后系统可推导工时"
            />
            <DatePickerField
              label="结束时间"
              value={endedAt}
              onChange={setEndedAt}
              mode="datetime"
              showCurrentShortcut
              placeholder="可选，选择后系统可推导工时"
            />
            <FormField
              label="有效工时（分钟）"
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              keyboardType="numeric"
              placeholder="可手填，未填时按开始/结束时间推导"
            />
            {isAbnormalDuration ? (
              <>
                <Text style={[styles.constraintText, { color: colors.warning }]}>
                  本次工时超过 24 小时，若为跨日或补录请确认并说明
                </Text>
                <FormSwitch
                  label="异常工时确认（跨日/补录）"
                  value={abnormalDurationConfirmed}
                  onValueChange={setAbnormalDurationConfirmed}
                />
                {abnormalDurationConfirmed ? (
                  <FormField
                    label="跨日/补录工时说明"
                    value={abnormalDurationNote}
                    onChangeText={setAbnormalDurationNote}
                    placeholder="请说明跨日作业或事后补录原因"
                    multiline
                    numberOfLines={2}
                  />
                ) : null}
              </>
            ) : null}
          </>
        ) : null}
        {op ? (
          <FormField
            label="实测准备/换型（分钟）"
            value={actualSetupMinutes}
            onChangeText={(value) => {
              setActualSetupMinutes(value);
              setActualSetupMinutesError(
                parseOptionalNonNegativeNumber(value) === null ? '请输入不小于 0 的分钟数' : '',
              );
            }}
            error={actualSetupMinutesError}
            keyboardType="decimal-pad"
            placeholder="可选；仅记录本次实测值"
          />
        ) : null}
        {showReceiptWarehouseSection ? (
          <>
            <View
              style={[styles.receiptWarehouseCard, { backgroundColor: colors.surfaceSecondary }]}
            >
              <View style={styles.receiptWarehouseSummary}>
                <View style={styles.receiptWarehouseSummaryText}>
                  <Text style={[styles.receiptWarehouseLabel, { color: colors.textSecondary }]}>
                    当前入库仓
                  </Text>
                  <Text style={[styles.receiptWarehouseValue, { color: colors.text }]}>
                    {currentReceiptWarehouseName}
                  </Text>
                </View>
                {showReceiptWarehouseOverride &&
                !receiptWarehouseLocked &&
                currentReceiptWarehouse?.id ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={receiptWarehouseEditorOpen ? '取消改仓' : '修改入库仓'}
                    accessibilityState={{ expanded: receiptWarehouseEditorOpen }}
                    onPress={() => {
                      if (receiptWarehouseEditorOpen) {
                        setSelectedReceiptWarehouse(null);
                        setReceiptWarehouseChangeReason('');
                        setSelectedReceiptLocation(null);
                        setReceiptStorageLocation('');
                        setReceiptLocationRequired(false);
                        setReceiptWarehouseEditorOpen(false);
                        return;
                      }
                      setReceiptWarehouseEditorOpen(true);
                    }}
                    style={({ pressed }) => [
                      styles.receiptWarehouseEditButton,
                      { opacity: pressed ? 0.65 : 1 },
                    ]}
                  >
                    <Ionicons
                      name={receiptWarehouseEditorOpen ? 'close-outline' : 'create-outline'}
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={[styles.receiptWarehouseEditText, { color: colors.primary }]}>
                      {receiptWarehouseEditorOpen ? '取消改仓' : '修改'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            {showReceiptWarehouseOverride ? (
              receiptWarehouseLocked ? (
                <Text style={[styles.constraintText, { color: colors.warning }]}>
                  已发生首笔完工入库，当前工单入库仓已锁定；如需调整请走库存调仓。
                </Text>
              ) : receiptWarehouseEditorOpen || !currentReceiptWarehouse?.id ? (
                <>
                  <WarehousePickerField
                    label="改入库仓"
                    value={selectedReceiptWarehouse}
                    onChange={(warehouse) => {
                      setSelectedReceiptWarehouse(warehouse);
                      setReceiptWarehouseChangeReason('');
                      setSelectedReceiptLocation(null);
                      setReceiptStorageLocation('');
                      setReceiptLocationRequired(false);
                    }}
                    candidateWarehouses={receiptWarehouseCandidates}
                    candidateOrder="business-priority"
                    placeholder="请选择目标入库仓"
                    title="选择改入库仓"
                  />
                  <Text style={[styles.receiptWarehouseHint, { color: colors.textSecondary }]}>
                    提交后作为本工单后续完工入库仓；开始入库后如需调整请走库存调仓。
                  </Text>
                  {selectedReceiptWarehouse?.id !== currentReceiptWarehouse?.id ? (
                    <FormField
                      label="改仓原因"
                      value={receiptWarehouseChangeReason}
                      onChangeText={setReceiptWarehouseChangeReason}
                      placeholder="改仓时必填"
                      multiline
                      numberOfLines={2}
                    />
                  ) : null}
                </>
              ) : null
            ) : null}
            <StockLocationField
              label="入库仓位"
              action={op?.id ? 'work-order/report' : 'work-order/report-direct'}
              warehouseId={effectiveReceiptWarehouseId}
              value={selectedReceiptLocation}
              onChange={setSelectedReceiptLocation}
              storageLocation={receiptStorageLocation}
              onStorageLocationChange={setReceiptStorageLocation}
              showStorageLocationText
              onRequirementChange={setReceiptLocationRequired}
            />
          </>
        ) : null}
        {showQuantityFields ? (
          <>
            {showOperationReportQtyFields ? (
              <>
                <QuickNumInput
                  label={`良品报工量（${operationReportUnit}）`}
                  value={reportedOperationQty}
                  onChangeText={setReportedOperationQty}
                  max={operationReportMaxQty}
                  hint={
                    operationReportMaxQty != null
                      ? `最多约 ${operationReportMaxQty} ${operationReportUnit}`
                      : undefined
                  }
                  clampToBounds={false}
                  placeholder="0"
                  precision={inputScale}
                />
                <QuickNumInput
                  label={`报废报工量（${operationReportUnit}）`}
                  value={reportedOperationScrappedQty}
                  onChangeText={(value) => {
                    setReportedOperationScrappedQty(value);
                    if (Number(value || 0) <= 0) {
                      setScrappedSerialNumbersText('');
                      setShowScrappedSerialEntry(false);
                    }
                  }}
                  clampToBounds={false}
                  quickButtons={[
                    { label: '0', value: 'min' },
                    { label: '+1', value: 1 },
                  ]}
                  placeholder="0"
                  precision={inputScale}
                />
                <Text style={[styles.constraintText, { color: colors.textSecondary }]}>
                  折算良品 {convertedCompletedQty} {productUnitLabel}，折算报废{' '}
                  {convertedScrappedQty} {productUnitLabel}
                </Text>
              </>
            ) : (
              <>
                <QuickNumInput
                  label={`良品数量（剩余 ${maxQty}）`}
                  value={completedQty}
                  onChangeText={setCompletedQty}
                  max={completedMax}
                  hint={`最多 ${completedMax}`}
                  error={completedQtyError}
                  clampToBounds={false}
                  placeholder="0"
                  precision={inputScale}
                />
                <QuickNumInput
                  label="报废数量"
                  value={scrappedQty}
                  onChangeText={(value) => {
                    setScrappedQty(value);
                    if (Number(value || 0) <= 0) {
                      setScrappedSerialNumbersText('');
                      setShowScrappedSerialEntry(false);
                    }
                  }}
                  max={scrappedMax}
                  hint={`最多 ${scrappedMax}`}
                  error={scrappedQtyError}
                  clampToBounds={false}
                  quickButtons={[
                    { label: '0', value: 'min' },
                    { label: '+1', value: 1 },
                  ]}
                  placeholder="0"
                  precision={inputScale}
                />
              </>
            )}
            {allowZeroQuantity && totalQty <= 0 ? (
              <ChipSelectField
                label="零数量原因"
                required
                options={EXECUTION_REASON_OPTIONS}
                value={zeroQuantityReason}
                onChange={setZeroQuantityReason}
                overflow="scroll"
              />
            ) : null}
            {needsProductSerials ? (
              <>
                <View style={{ gap: Spacing.xs }}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void handleAllocatedSerialsToggle()}
                  >
                    <Text
                      style={{ color: colors.primary, fontSize: FontSize.sm, fontWeight: '600' }}
                    >
                      {showAllocatedSerials ? '收起已分配序列号' : '查看已分配序列号'}
                    </Text>
                  </Pressable>
                  <Text style={[styles.constraintText, { color: colors.textSecondary }]}>
                    工单下达时已分配序列号；良品数量 {convertedCompletedQty}{' '}
                    件将由系统自动绑定对应号码。
                  </Text>
                  {showAllocatedSerials ? (
                    <View
                      style={{
                        borderColor: colors.border,
                        borderRadius: Radius.sm,
                        borderWidth: StyleSheet.hairlineWidth,
                        padding: Spacing.sm,
                      }}
                    >
                      {allocatedSerialsLoading ? (
                        <Text style={{ color: colors.textSecondary }}>正在读取序列号…</Text>
                      ) : allocatedSerialsError ? (
                        <Text style={{ color: colors.error }}>{allocatedSerialsError}</Text>
                      ) : allocatedSerials.length === 0 ? (
                        <Text style={{ color: colors.textSecondary }}>
                          当前工单没有已分配的成品序列号。
                        </Text>
                      ) : (
                        <>
                          <Text style={{ color: colors.textSecondary, marginBottom: Spacing.xs }}>
                            共 {allocatedSerials.length} 个，待报工{' '}
                            {allocatedSerials.filter((item) => item.status === 'allocated').length}{' '}
                            个
                          </Text>
                          {allocatedSerials.map((item) => (
                            <View
                              key={item.id}
                              style={{
                                borderBottomColor: colors.border,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingVertical: Spacing.xs,
                              }}
                            >
                              <Text style={{ color: colors.text }}>{item.serialNo}</Text>
                              <Text style={{ color: colors.textSecondary }}>
                                {SERIAL_STATUS_LABELS[item.status] ?? '未知状态'}
                              </Text>
                            </View>
                          ))}
                        </>
                      )}
                    </View>
                  ) : null}
                </View>
                {convertedScrappedQty > 0 ? (
                  <View style={{ gap: Spacing.xs }}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        const next = !showScrappedSerialEntry;
                        setShowScrappedSerialEntry(next);
                        if (!next) setScrappedSerialNumbersText('');
                      }}
                    >
                      <Text
                        style={{ color: colors.primary, fontSize: FontSize.sm, fontWeight: '600' }}
                      >
                        {showScrappedSerialEntry ? '收起已贴码报废登记' : '登记已贴码报废品'}
                      </Text>
                    </Pressable>
                    {showScrappedSerialEntry ? (
                      <>
                        <SerialNumbersField
                          label="已贴码报废品序列号"
                          value={scrappedSerialNumbersText}
                          onChangeText={setScrappedSerialNumbersText}
                          placeholder="扫码或粘贴已贴在产品上的序列号"
                          numberOfLines={2}
                        />
                        <Text style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>
                          没有贴码的报废品无需登记序列号。
                        </Text>
                      </>
                    ) : null}
                  </View>
                ) : null}
              </>
            ) : null}
            {convertedScrappedQty > 0 ? (
              <>
                <FormField
                  label="报废原因"
                  value={scrapReason}
                  onChangeText={setScrapReason}
                  placeholder="请输入报废原因"
                  multiline
                  numberOfLines={2}
                />
                <PhotoPicker
                  photos={scrapPhotos}
                  onPhotosChange={setScrapPhotos}
                  maxCount={5}
                  label={scrapPhotoRequired ? '报废照片（必填）' : '报废照片'}
                />
                <Text
                  style={[
                    styles.constraintText,
                    { color: scrapPhotoRequired ? colors.error : colors.textSecondary },
                  ]}
                >
                  {scrapPhotoRequired
                    ? `${
                        scrapPolicyPreview?.policyName
                          ? `命中报废策略「${scrapPolicyPreview.policyName}」，`
                          : ''
                      }本次报废需上传照片才能提交`
                    : '若命中的报废策略要求照片，未上传会被后端拦截。'}
                </Text>
              </>
            ) : null}
            <PhotoPicker
              photos={photos}
              onPhotosChange={setPhotos}
              maxCount={5}
              label="现场照片（可选）"
            />
            <ReportBatchNoField
              visible={visible}
              workOrderId={op?.workOrderId ?? workOrderId}
              value={batchNo}
              initialBatchNo={initialBatchNo}
              onChange={setBatchNo}
              onRequiredChange={setBatchRequired}
              onOptionsLoadingChange={setBatchOptionsLoading}
            />
          </>
        ) : isExecutionQuantity ? (
          <>
            <QuickNumInput
              label="执行量"
              value={executionQty}
              onChangeText={setExecutionQty}
              unit={executionUnitDisplay || undefined}
              quickButtons={[
                { label: '+1', value: 1 },
                { label: '+10', value: 10 },
              ]}
              max={executionQtyMax ?? undefined}
              hint={
                executionQtyMax != null ? `最多 ${formatReportQty(executionQtyMax)}` : undefined
              }
              clampToBounds={false}
              placeholder="请输入本次执行量"
              precision={inputScale}
              required
            />
            {requiresExecutionReason ? (
              <Text style={[styles.constraintText, { color: colors.warning }]}>
                执行量超过 {formatReportQty(executionCapability?.reasonRequiredBeyond ?? 0)}
                ，请填写原因或备注。
              </Text>
            ) : null}
            <PickerField
              label="执行量单位"
              value={executionUnit}
              options={executionUnitOptions}
              onChange={setExecutionUnit}
              placeholder="如次、面、遍、点、件次"
              required
            />
            <ChipSelectField
              label="执行原因"
              required={requiresExecutionReason}
              options={EXECUTION_REASON_OPTIONS}
              value={executionReason}
              onChange={setExecutionReason}
              overflow="scroll"
            />
          </>
        ) : (
          <ChipSelectField
            label="执行原因"
            required
            options={EXECUTION_REASON_OPTIONS}
            value={executionReason}
            onChange={setExecutionReason}
            overflow="scroll"
          />
        )}
        <EntityPickerField<Equipment>
          label="使用设备"
          value={selectedEquipment}
          onChange={handleEquipmentChange}
          fetchFn={async (p) => {
            const pageSize = op?.allowedEquipmentIds?.length
              ? Math.max(p.pageSize, op.allowedEquipmentIds.length)
              : p.pageSize;
            const result = await equipmentService.list({
              ...p,
              pageSize,
              equipmentType: op?.equipmentType ?? undefined,
              // 已上机设备会被标记为 occupied，报工记录 OEE 时也必须可选。
              statuses: [EquipmentListDto.status.ACTIVE, EquipmentListDto.status.OCCUPIED],
            });
            const list = filterEquipmentsForOperation(result.list, op);
            return {
              list,
              total: op?.allowedEquipmentIds?.length ? list.length : result.total,
            };
          }}
          keyExtractor={(e) => e.id}
          labelExtractor={(e) => `${e.name}（${e.code}）`}
          sublabelExtractor={(e) => (e.model ? (equipmentModelLabelMap[e.model] ?? e.model) : '')}
          placeholder="可选，选择设备以记录OEE"
          clearable
        />
        <FormField
          label="备注"
          value={remark}
          onChangeText={setRemark}
          placeholder="可选备注"
          multiline
          numberOfLines={3}
        />
      </FullScreenModal>
      <BottomSheet
        visible={inspectionGateSheetVisible}
        onClose={() => setInspectionGateSheetVisible(false)}
        title="申请首工单放行"
        subtitle="申请仅绑定当前设备、工单和业务日期，主管批准后使用一次。"
        confirmText="提交申请"
        loading={inspectionGateRequesting}
        disabled={inspectionGateReason.trim().length < 3}
        confirmDisabledHint="请填写至少 3 个字的放行原因"
        onConfirm={() => void requestInspectionGateRelease()}
        avoidKeyboard
        maxHeightRatio={0.55}
      >
        <FormField
          label="放行原因"
          required
          value={inspectionGateReason}
          onChangeText={setInspectionGateReason}
          placeholder="说明未能按时点检的原因及现场处理措施"
          multiline
          numberOfLines={4}
          maxLength={1000}
        />
      </BottomSheet>
    </>
  );
}

function ToolingGatePanel({
  gate,
  loading,
  error,
}: {
  gate: ToolingGateDto | null;
  loading: boolean;
  error: string | null;
}) {
  const { colors } = useTheme();
  if (loading) {
    return (
      <View style={[styles.toolingGateCard, { backgroundColor: colors.surfaceSecondary }]}>
        <Text style={[styles.toolingGateText, { color: colors.textSecondary }]}>
          正在读取工装预检...
        </Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.toolingGateCard, { backgroundColor: colors.surfaceSecondary }]}>
        <Text style={[styles.constraintText, { color: colors.warning }]}>{error}</Text>
      </View>
    );
  }
  if (!gate?.required) return null;

  const allowedSummary =
    gate.allowedToolingIds.length > 0
      ? `${gate.allowedToolingIds.length} 套候选`
      : gate.requiredToolingType
        ? '按工装类型匹配'
        : '未限制';
  const runningSummary = gate.runningSessions
    .map(
      (session) =>
        session.toolingCode ??
        session.toolingName ??
        session.tooling?.toolingCode ??
        session.tooling?.name ??
        session.toolingId,
    )
    .filter(Boolean)
    .join('、');

  return (
    <View style={[styles.toolingGateCard, { backgroundColor: colors.surfaceSecondary }]}>
      <View style={styles.toolingGateTitleRow}>
        <Ionicons name="hammer-outline" size={16} color={colors.primary} />
        <Text style={[styles.toolingGateTitle, { color: colors.text }]}>工装预检</Text>
      </View>
      <Text style={[styles.toolingGateText, { color: colors.textSecondary }]}>
        要求类型：{gate.requiredToolingType || '未配置'}；候选范围：{allowedSummary}
      </Text>
      {runningSummary ? (
        <Text style={[styles.toolingGateText, { color: colors.text }]}>
          当前绑定：{runningSummary}
        </Text>
      ) : null}
      {gate.blockers.map((message) => (
        <Text key={`blocker-${message}`} style={[styles.constraintText, { color: colors.error }]}>
          {message}
        </Text>
      ))}
      {gate.warnings.map((message) => (
        <Text key={`warning-${message}`} style={[styles.constraintText, { color: colors.warning }]}>
          {message}
        </Text>
      ))}
      {gate.recommendedToolings.length > 0 ? (
        <View style={styles.toolingRecommendationList}>
          <Text style={[styles.toolingGateText, { color: colors.textSecondary }]}>推荐候选：</Text>
          {gate.recommendedToolings.slice(0, 3).map((tooling) => (
            <View key={tooling.id} style={styles.toolingRecommendationItem}>
              <Text style={[styles.toolingGateText, { color: colors.text }]}>
                {tooling.toolingCode} {tooling.name} · {tooling.spec || '未填写规格'}
              </Text>
              <AttachmentFilesField
                label="图纸"
                files={tooling.drawingUrls ?? []}
                emptyText="暂无图纸资料"
              />
            </View>
          ))}
        </View>
      ) : null}
      {gate.nextStep ? (
        <Text style={[styles.toolingGateText, { color: colors.textSecondary }]}>
          {gate.nextStep}
        </Text>
      ) : null}
    </View>
  );
}

function AssigneeBanner({
  assignee,
}: {
  assignee: { realName?: string | null; username?: string };
}) {
  const { colors } = useTheme();
  return (
    <View style={[assigneeStyles.banner, { backgroundColor: `${colors.primary}12` }]}>
      <Ionicons name="person-outline" size={14} color={colors.primary} />
      <Text style={[assigneeStyles.text, { color: colors.primary }]}>
        指派给：{assignee.realName || assignee.username}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  auxiliaryHint: {
    fontSize: FontSize.sm,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  payPreviewText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  operationReportCard: {
    borderRadius: Radius.md,
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  operationReportTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  operationReportMeta: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  toolingGateCard: {
    borderRadius: Radius.md,
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  inspectionGateCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    gap: Spacing.xs,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  inspectionGateButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectionGateButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  toolingGateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  toolingGateTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  toolingGateText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  toolingRecommendationList: {
    gap: Spacing.xs,
  },
  toolingRecommendationItem: {
    gap: 2,
    paddingLeft: Spacing.xs,
  },
  scheduleSlotCard: {
    borderRadius: Radius.md,
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
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
  timeSessionCard: {
    borderRadius: Radius.md,
    gap: 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  timeSessionLabel: { fontSize: FontSize.xs, fontWeight: '500' },
  timeSessionValue: { fontSize: FontSize.sm, fontWeight: '600' },
  receiptWarehouseCard: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  receiptWarehouseSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  receiptWarehouseSummaryText: { flex: 1, gap: 2 },
  receiptWarehouseLabel: { fontSize: FontSize.xs, fontWeight: '500' },
  receiptWarehouseValue: { fontSize: FontSize.sm, fontWeight: '600' },
  receiptWarehouseEditButton: {
    minHeight: 44,
    paddingHorizontal: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  receiptWarehouseEditText: { fontSize: FontSize.sm, fontWeight: '600' },
  receiptWarehouseHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  summary: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  constraintText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
});

const assigneeStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
