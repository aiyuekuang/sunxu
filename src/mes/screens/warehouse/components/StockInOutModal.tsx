import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { type Material, materialService } from '../../../host/services';
import { uploadService } from '../../../host/services';
import {
  compareWarehousesByDisplayOrder,
  type Stock,
  type StockInOperationType,
  type StockOutOperationType,
  StockTransactionType,
  type Warehouse,
  warehouseService,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { PhotoPicker } from '../../../../core/components/PhotoPicker.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import { PAGE_SIZE } from '../../../constants/enums';
import { stockTransactionLabel } from '../../../constants/status-configs';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import {
  getReceiptWarehouseFamiliesByMaterialType,
  getReceiptWarehouseFamilyLabelByMaterialType,
  resolveMaterialBaseType,
} from '../../../screen-support/work-orders/receipt-warehouse-policy';
import { formatNumber } from '../../../../core/utils/format';
import { formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';
import { getAvailableQty } from '../utils';
import { type SelectedStockLocation, StockLocationField } from './StockLocationField.tsx';
import { WarehouseCandidateField, type WarehouseCandidateOption } from './WarehouseCandidateField.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * 仓库直接操作允许的类型
 *
 * 必须通过业务单据的类型（不在此列表）：
 * - in_purchase    → 入库单（PurchaseReceipt）
 * - in_production  → 工单报工（自动完工入库）
 * - out_sale       → 销售出库单（SaleDelivery）
 * - in/out_transfer → 库存调拨（stockTransfer）
 */
/**
 * @enum 代码逻辑依赖，不可改为字典
 * 原因：后端 warehouse.dto.ts 中 @IsIn() 白名单校验，新增值会被 400 拒绝
 * 审计日期：2026-04-02
 * 中文名统一取 STOCK_TRANSACTION_TYPE_CONFIG（stockTransactionLabel）
 */
const TX_TYPE_LABELS: { value: StockTransactionType; label: string; isIn: boolean }[] = [
  {
    value: StockTransactionType.IN_OTHER,
    label: stockTransactionLabel(StockTransactionType.IN_OTHER),
    isIn: true,
  },
  {
    value: StockTransactionType.IN_RETURN,
    label: stockTransactionLabel(StockTransactionType.IN_RETURN),
    isIn: true,
  },
  {
    value: StockTransactionType.OUT_OTHER,
    label: stockTransactionLabel(StockTransactionType.OUT_OTHER),
    isIn: false,
  },
  {
    value: StockTransactionType.OUT_SCRAP,
    label: stockTransactionLabel(StockTransactionType.OUT_SCRAP),
    isIn: false,
  },
];

const TX_TYPE_TIPS: Record<string, string> = {
  in_other: '仅用于样品、盘盈、初始化等非经营性库存增加；客户退货和成品拆包换料号不要走这里',
  in_return: '已出库的物料因退货等原因退回仓库',
  out_other: '仅用于样品、赠品、盘亏等非经营性库存减少；正常发货、转配件、转 KD 或换料号不要走这里',
  out_scrap: '物料损坏/过期无法使用，从库存中清除',
};
const TX_TYPE_NOTICES: Record<string, string> = {
  in_other: '仅用于非经营性入库；客户退货和成品拆包换料号请走对应单据。',
  in_return: '退货等原因退回已出库物料。',
  out_other: '仅用于非经营性出库；正常发货、转配件、转 KD 或换料号请走对应单据。',
  out_scrap: '报废会从库存中扣减。',
};

const DIRECT_OPERATION_REASON_OPTIONS: Partial<
  Record<StockTransactionType, { label: string; value: string }[]>
> = {
  [StockTransactionType.IN_OTHER]: [
    { label: '初始化入库', value: 'initial_stock' },
    { label: '样品退回', value: 'sample_return' },
    { label: '实施调整', value: 'implementation_adjustment' },
    { label: '其他非经营性入库', value: 'non_operating' },
  ],
  [StockTransactionType.OUT_OTHER]: [
    { label: '样品领用', value: 'sample' },
    { label: '赠品发放', value: 'gift' },
    { label: '非生产内部领用', value: 'internal_non_production' },
    { label: '试制/测试消耗', value: 'trial_consumption' },
    { label: '其他非经营性消耗', value: 'non_operating' },
    { label: '非经营库存调整', value: 'stock_adjustment' },
    { label: '实施调整', value: 'implementation_adjustment' },
  ],
  [StockTransactionType.OUT_SCRAP]: [
    { label: '物料损坏', value: 'damaged' },
    { label: '过期失效', value: 'expired' },
    { label: '质检不合格', value: 'quality_reject' },
    { label: '其他报废', value: 'scrap_other' },
  ],
};

const RAW_WAREHOUSE_ALIASES = new Set([
  'raw_material',
  'raw',
  'cold_raw',
  'raw_controlled',
  'dry_storage',
  '原料仓',
  '原材料仓',
]);
const WIP_WAREHOUSE_ALIASES = new Set(['wip', 'semi', 'semi_finished', '在制品仓', '半成品仓']);
const FINISHED_WAREHOUSE_ALIASES = new Set([
  'finished_goods',
  'finished',
  'finished_warehouse',
  'cold_finished',
  'finished_temp_ctrl',
  'sterile_storage',
  'finished_chem',
  'finished_uv',
  'warehouse_medical',
  '成品仓',
  '成品库',
  '产成品仓',
  '产成品库',
]);
const GENERAL_WAREHOUSE_ALIASES = new Set([
  'general',
  'packaging_wh',
  'quarantine',
  'hazmat_wh',
  'flammable_wh',
  'general_chem',
  'ink_storage_wh',
  'substrate_wh',
  'consumable_wh',
]);
const LINE_SIDE_WAREHOUSE_ALIASES = new Set(['line_side', 'lineside', 'line-side', '线边仓']);
const DEFECTIVE_WAREHOUSE_ALIASES = new Set(['defective', 'defect', '不良仓', '报废仓']);

function containsWarehouseKeyword(raw: string, normalized: string, keyword: string): boolean {
  const loweredKeyword = keyword.toLowerCase();
  const isAscii = /^[a-z_-]+$/.test(loweredKeyword);
  return isAscii ? normalized.includes(loweredKeyword) : raw.includes(keyword);
}

function getWarehouseFamily(type?: string | null): string {
  const raw = type?.trim() ?? '';
  const normalized = raw.toLowerCase();
  if (!normalized) return '';

  if (
    RAW_WAREHOUSE_ALIASES.has(normalized) ||
    containsWarehouseKeyword(raw, normalized, 'raw') ||
    containsWarehouseKeyword(raw, normalized, '原料')
  ) {
    return 'raw_material';
  }
  if (
    WIP_WAREHOUSE_ALIASES.has(normalized) ||
    containsWarehouseKeyword(raw, normalized, 'semi') ||
    containsWarehouseKeyword(raw, normalized, 'wip') ||
    containsWarehouseKeyword(raw, normalized, '半成品') ||
    containsWarehouseKeyword(raw, normalized, '在制品')
  ) {
    return 'wip';
  }
  if (
    FINISHED_WAREHOUSE_ALIASES.has(normalized) ||
    containsWarehouseKeyword(raw, normalized, 'finished') ||
    containsWarehouseKeyword(raw, normalized, '成品') ||
    containsWarehouseKeyword(raw, normalized, '产成品')
  ) {
    return 'finished_goods';
  }
  if (
    GENERAL_WAREHOUSE_ALIASES.has(normalized) ||
    containsWarehouseKeyword(raw, normalized, 'general') ||
    containsWarehouseKeyword(raw, normalized, '通用')
  ) {
    return 'general';
  }
  if (
    LINE_SIDE_WAREHOUSE_ALIASES.has(normalized) ||
    containsWarehouseKeyword(raw, normalized, 'line_side') ||
    containsWarehouseKeyword(raw, normalized, 'lineside') ||
    containsWarehouseKeyword(raw, normalized, 'line-side') ||
    containsWarehouseKeyword(raw, normalized, '线边')
  ) {
    return 'line_side';
  }
  if (
    DEFECTIVE_WAREHOUSE_ALIASES.has(normalized) ||
    containsWarehouseKeyword(raw, normalized, 'defect') ||
    containsWarehouseKeyword(raw, normalized, '不良') ||
    containsWarehouseKeyword(raw, normalized, '报废')
  ) {
    return 'defective';
  }
  return normalized;
}

export interface StockInOutModalProps {
  warehouses: Warehouse[];
  currentWarehouseId?: string | null;
  mode: 'in' | 'out';
  onClose: () => void;
  onSuccess: () => void;
}

interface StockOperationForm {
  qty: string;
  type: StockTransactionType;
  referenceNo: string;
  reasonCode: string;
  remarks: string;
  batchNo: string;
  productionDate: string;
  expiryDate: string;
}

function isStockInOperationType(type: StockTransactionType): type is StockInOperationType {
  return type === StockTransactionType.IN_OTHER || type === StockTransactionType.IN_RETURN;
}

function isStockOutOperationType(type: StockTransactionType): type is StockOutOperationType {
  return type === StockTransactionType.OUT_OTHER || type === StockTransactionType.OUT_SCRAP;
}

function getRequiredReasonLabel(type: StockTransactionType): string | undefined {
  if (type === StockTransactionType.IN_OTHER) return '入库原因';
  if (type === StockTransactionType.OUT_OTHER) return '出库原因';
  if (type === StockTransactionType.OUT_SCRAP) return '报废原因';
  return undefined;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StockInOutModal({
  warehouses,
  currentWarehouseId,
  onClose,
  onSuccess,
  mode,
}: StockInOutModalProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [saving, setSaving] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    mode === 'in' ? (warehouses[0] ?? null) : null,
  );
  const [selectedLocation, setSelectedLocation] = useState<SelectedStockLocation | null>(null);
  const [storageLocation, setStorageLocation] = useState('');
  const [locationRequired, setLocationRequired] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [materialStocks, setMaterialStocks] = useState<Stock[]>([]);
  const [loadingMaterialStocks, setLoadingMaterialStocks] = useState(false);
  const [materialStocksError, setMaterialStocksError] = useState<string | null>(null);
  const [warehouseTouched, setWarehouseTouched] = useState(false);
  const [form, setForm] = useState<StockOperationForm>({
    qty: '',
    type: mode === 'in' ? StockTransactionType.IN_OTHER : StockTransactionType.OUT_OTHER,
    referenceNo: '',
    reasonCode: '',
    remarks: '',
    batchNo: '',
    productionDate: '',
    expiryDate: '',
  });
  const stockRequestRef = useRef(0);
  const warehousesById = useMemo(
    () => new Map(warehouses.map((item) => [item.id, item])),
    [warehouses],
  );
  const selectedMaterialBaseType = useMemo(
    () => resolveMaterialBaseType(selectedMaterial),
    [selectedMaterial],
  );
  const effectiveShelfLifeDays = Number(
    selectedMaterial?.shelfLifeDays ?? selectedMaterial?.family?.defaultShelfLifeDays ?? 0,
  );
  const batchRequired = Boolean(selectedMaterial?.hasBatchTracking || effectiveShelfLifeDays > 0);
  const expiryRequired = effectiveShelfLifeDays > 0;
  const inboundBatchError =
    mode === 'in' && batchRequired && !form.batchNo.trim()
      ? '该物料启用了批号追溯或设置了保质期，请填写批号'
      : mode === 'in' && expiryRequired && !form.productionDate && !form.expiryDate
        ? '该物料设置了保质期，请填写生产日期或有效期'
        : undefined;
  const inTypes = TX_TYPE_LABELS.filter((t) => t.isIn === (mode === 'in'));
  const parsedQty = Number(form.qty);
  const hasValidQty = form.qty.trim() !== '' && !Number.isNaN(parsedQty) && parsedQty > 0;
  const requiredReasonLabel = getRequiredReasonLabel(form.type);
  const reasonOptions = DIRECT_OPERATION_REASON_OPTIONS[form.type] ?? [];

  /** 根据操作类型获取关联单据的 referenceNo 和 referenceId */
  const getReference = (): { referenceNo?: string; referenceId?: string } => {
    return { referenceNo: form.referenceNo || undefined };
  };

  const resetWarehouseInventoryState = useCallback(() => {
    setSelectedWarehouse(null);
    setSelectedLocation(null);
    setStorageLocation('');
    setLocationRequired(false);
    setWarehouseTouched(false);
    setMaterialStocks([]);
    setMaterialStocksError(null);
  }, []);

  /** 选择物料后同步重置仓库候选 */
  const handleMaterialChange = useCallback(
    (m: Material | null) => {
      setSelectedMaterial(m);
      if (mode === 'in') {
        setForm((current) => ({
          ...current,
          batchNo: '',
          productionDate: '',
          expiryDate: '',
        }));
      }
      if (mode === 'out') {
        resetWarehouseInventoryState();
      }
    },
    [mode, resetWarehouseInventoryState],
  );

  /** 物料数据源：直接按库存治理场景搜索物料 */
  const fetchMaterialOptions = useCallback(
    (p: { page: number; pageSize: number; keyword?: string; categoryId?: string }) => {
      // 尾库存治理场景仍需处理停用料；只有未来生产领料继续限制为启用料。
      const includeInactive = true;
      return materialService.list({
        page: p.page,
        pageSize: p.pageSize,
        keyword: p.keyword,
        categoryId: p.categoryId,
        includeInactive,
      });
    },
    [],
  );

  const loadMaterialStocks = useCallback(async (materialId: string) => {
    const firstPage = await warehouseService.listStocks({
      materialId,
      page: 1,
      pageSize: PAGE_SIZE.LARGE,
    });
    const list = [...firstPage.list];
    let page = 2;
    while (list.length < firstPage.total) {
      const nextPage = await warehouseService.listStocks({
        materialId,
        page,
        pageSize: PAGE_SIZE.LARGE,
      });
      if (nextPage.list.length === 0) break;
      list.push(...nextPage.list);
      if (nextPage.list.length < PAGE_SIZE.LARGE) break;
      page += 1;
    }
    return list;
  }, []);

  useEffect(() => {
    if (mode !== 'out' || !selectedMaterial) {
      setMaterialStocks([]);
      setMaterialStocksError(null);
      setLoadingMaterialStocks(false);
      return;
    }

    const requestId = stockRequestRef.current + 1;
    stockRequestRef.current = requestId;
    setLoadingMaterialStocks(true);
    setMaterialStocksError(null);

    void loadMaterialStocks(selectedMaterial.id)
      .then((list) => {
        if (stockRequestRef.current !== requestId) return;
        setMaterialStocks(list);
      })
      .catch((e: unknown) => {
        if (stockRequestRef.current !== requestId) return;
        const message = e instanceof Error ? e.message : '加载仓库库存失败';
        setMaterialStocks([]);
        setMaterialStocksError(message);
        toast.error(message);
      })
      .finally(() => {
        if (stockRequestRef.current === requestId) {
          setLoadingMaterialStocks(false);
        }
      });
  }, [loadMaterialStocks, mode, selectedMaterial]);

  const warehouseCandidates = useMemo<WarehouseCandidateOption[]>(() => {
    if (mode !== 'out' || !selectedMaterial) return [];

    const requiredQty = hasValidQty ? parsedQty : 0;
    const preferredWarehouseId = currentWarehouseId ?? '';
    const defaultWarehouseId = selectedMaterial.defaultWarehouseId ?? '';

    return materialStocks
      .map((stock) => {
        const warehouse = stock.warehouse ?? warehousesById.get(stock.warehouseId);
        if (!warehouse) return null;

        const availableQty = getAvailableQty(stock);
        if (availableQty <= 0) return null;

        return {
          warehouse,
          availableQty,
          canFulfillQty: requiredQty <= 0 ? true : availableQty >= requiredQty,
          isPreferredWarehouse:
            preferredWarehouseId !== '' && warehouse.id === preferredWarehouseId,
          isDefaultWarehouse: defaultWarehouseId !== '' && warehouse.id === defaultWarehouseId,
        };
      })
      .filter(
        (
          item,
        ): item is WarehouseCandidateOption & {
          isPreferredWarehouse: boolean;
          isDefaultWarehouse: boolean;
        } => item !== null,
      )
      .sort((a, b) => {
        if (Number(b.canFulfillQty) !== Number(a.canFulfillQty)) {
          return Number(b.canFulfillQty) - Number(a.canFulfillQty);
        }
        if (Number(b.isPreferredWarehouse) !== Number(a.isPreferredWarehouse)) {
          return Number(b.isPreferredWarehouse) - Number(a.isPreferredWarehouse);
        }
        if (Number(b.isDefaultWarehouse) !== Number(a.isDefaultWarehouse)) {
          return Number(b.isDefaultWarehouse) - Number(a.isDefaultWarehouse);
        }
        const displayOrder = compareWarehousesByDisplayOrder(a.warehouse, b.warehouse);
        if (displayOrder !== 0) return displayOrder;
        if (b.availableQty !== a.availableQty) {
          return b.availableQty - a.availableQty;
        }
        return 0;
      })
      .map(({ warehouse, availableQty, canFulfillQty }) => ({
        warehouse,
        availableQty,
        canFulfillQty,
      }));
  }, [
    currentWarehouseId,
    hasValidQty,
    materialStocks,
    mode,
    parsedQty,
    selectedMaterial,
    warehousesById,
  ]);

  const inWarehouseOptions = useMemo(() => {
    if (mode !== 'in') return [];
    if (!selectedMaterial) return warehouses;
    const allowedFamilies = new Set<string>(
      getReceiptWarehouseFamiliesByMaterialType(selectedMaterialBaseType),
    );
    return warehouses.filter((warehouse) =>
      allowedFamilies.has(getWarehouseFamily(warehouse.type)),
    );
  }, [mode, selectedMaterial, selectedMaterialBaseType, warehouses]);

  const selectedWarehouseId = selectedWarehouse?.id ?? '';
  const locationMissing = locationRequired && !selectedLocation;
  const selectedWarehouseCandidate = useMemo(
    () =>
      mode === 'out'
        ? (warehouseCandidates.find((item) => item.warehouse.id === selectedWarehouseId) ?? null)
        : null,
    [mode, selectedWarehouseId, warehouseCandidates],
  );

  useEffect(() => {
    if (mode !== 'out') return;

    if (warehouseCandidates.length === 0) {
      if (selectedWarehouseId) setSelectedWarehouse(null);
      return;
    }

    const currentCandidate = warehouseCandidates.find(
      (item) => item.warehouse.id === selectedWarehouseId,
    );
    if (!currentCandidate) {
      setSelectedWarehouse(warehouseCandidates[0].warehouse);
      setWarehouseTouched(false);
      return;
    }

    if (!warehouseTouched && warehouseCandidates[0].warehouse.id !== selectedWarehouseId) {
      setSelectedWarehouse(warehouseCandidates[0].warehouse);
    }
  }, [mode, selectedWarehouseId, warehouseCandidates, warehouseTouched]);

  useEffect(() => {
    if (mode !== 'in') return;

    if (inWarehouseOptions.length === 0) {
      if (selectedWarehouseId) {
        setSelectedWarehouse(null);
      }
      return;
    }

    const currentExists = inWarehouseOptions.some(
      (warehouse) => warehouse.id === selectedWarehouseId,
    );
    if (!currentExists) {
      setSelectedWarehouse(inWarehouseOptions[0]);
    }
  }, [inWarehouseOptions, mode, selectedWarehouseId]);

  const qtyError =
    mode === 'out' &&
    selectedWarehouseCandidate &&
    hasValidQty &&
    selectedWarehouseCandidate.availableQty < parsedQty
      ? `该仓库可用库存不足（可用 ${formatNumber(selectedWarehouseCandidate.availableQty)}${
          selectedMaterial?.unit ? ` ${formatUnitLabel(selectedMaterial.unit, unitLabelMap)}` : ''
        }）`
      : undefined;

  const quantityHint =
    mode === 'out' && selectedWarehouseCandidate
      ? `当前仓库可用 ${formatNumber(selectedWarehouseCandidate.availableQty)}${
          selectedMaterial?.unit ? ` ${formatUnitLabel(selectedMaterial.unit, unitLabelMap)}` : ''
        }`
      : undefined;

  const submitDisabled =
    saving ||
    loadingMaterialStocks ||
    !selectedWarehouse ||
    !selectedMaterial ||
    !hasValidQty ||
    !!inboundBatchError ||
    !!qtyError ||
    locationMissing;
  const submitDisabledHint = saving
    ? `正在${mode === 'in' ? '入库' : '出库'}，请稍候`
    : loadingMaterialStocks
      ? '正在加载库存，请稍候'
      : !selectedWarehouse
        ? `请选择${mode === 'in' ? '入库' : '出库'}仓库`
        : !selectedMaterial
          ? '请选择物料'
          : !hasValidQty
            ? '请输入有效数量'
            : inboundBatchError
              ? inboundBatchError
              : qtyError
                ? qtyError
                : locationMissing
                  ? '请选择出库仓位'
                  : undefined;

  const handleScanMaterial = useCallback(
    async (barcode: string) => {
      try {
        const material = await materialService.findByBarcode(barcode);
        handleMaterialChange(material);
        toast.success(`已识别：${material.name}`);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : '物料识别失败');
      }
    },
    [handleMaterialChange],
  );

  const handleWarehouseCandidateChange = useCallback(
    (warehouseId: string) => {
      const candidate = warehouseCandidates.find((item) => item.warehouse.id === warehouseId);
      setSelectedWarehouse(candidate?.warehouse ?? null);
      setSelectedLocation(null);
      setStorageLocation('');
      setLocationRequired(false);
      setWarehouseTouched(true);
    },
    [warehouseCandidates],
  );

  const handleSubmit = async () => {
    if (!selectedWarehouse) {
      toast.error('请选择仓库');
      return;
    }
    if (!selectedMaterial) {
      toast.error('请选择物料');
      return;
    }
    if (inboundBatchError) {
      toast.error(inboundBatchError);
      return;
    }
    if (!form.qty || Number.isNaN(Number(form.qty)) || Number(form.qty) <= 0) {
      toast.error('请输入有效数量');
      return;
    }
    if (qtyError) {
      toast.error(qtyError);
      return;
    }
    if (locationMissing) {
      toast.error('请选择仓位');
      return;
    }
    if (requiredReasonLabel && !form.reasonCode) {
      toast.error('请选择操作原因');
      return;
    }
    setSaving(true);
    try {
      const ref = getReference();
      let photoUrls: string[] | undefined;
      if (mode === 'in' && photos.length > 0) {
        photoUrls = await uploadService.uploadImages(photos);
      }
      if (mode === 'in') {
        if (!isStockInOperationType(form.type)) {
          toast.error('请选择入库类型');
          return;
        }
        await warehouseService.stockIn({
          warehouseId: selectedWarehouse.id,
          materialId: selectedMaterial.id,
          type: form.type,
          qty: Number(form.qty),
          locationId: selectedLocation?.id,
          storageLocation: selectedLocation?.pathName || storageLocation.trim() || undefined,
          supplierId: undefined,
          batchNo: form.batchNo.trim() || undefined,
          productionDate: form.productionDate || undefined,
          expiryDate: form.expiryDate || undefined,
          referenceNo: ref.referenceNo,
          referenceId: ref.referenceId,
          reasonCode: form.reasonCode || undefined,
          remarks: form.remarks || undefined,
          photoUrls,
        });
      } else {
        if (!isStockOutOperationType(form.type)) {
          toast.error('请选择出库类型');
          return;
        }
        await warehouseService.stockOut({
          warehouseId: selectedWarehouse.id,
          materialId: selectedMaterial.id,
          type: form.type,
          qty: Number(form.qty),
          locationId: selectedLocation?.id,
          storageLocation: selectedLocation?.pathName || storageLocation.trim() || undefined,
          customerId: undefined,
          referenceNo: ref.referenceNo,
          referenceId: ref.referenceId,
          reasonCode: form.reasonCode || undefined,
          remarks: form.remarks || undefined,
        });
      }
      onSuccess();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '操作失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible
      onClose={onClose}
      title={mode === 'in' ? '入库操作' : '出库操作'}
      confirmText={mode === 'in' ? '确认入库' : '确认出库'}
      confirmButtonColor={mode === 'in' ? colors.success : colors.error}
      onConfirm={handleSubmit}
      loading={saving}
      disabled={submitDisabled}
      confirmDisabledHint={submitDisabledHint}
      avoidKeyboard
    >
      {/* 操作类型 */}
      <ChipSelectField
        label="操作类型"
        options={inTypes.map((t) => ({ value: t.value, label: t.label }))}
        value={form.type}
        onChange={(v) => {
          setForm((f) => ({
            ...f,
            type: v as StockTransactionType,
            qty: '',
            reasonCode: '',
            batchNo: '',
            productionDate: '',
            expiryDate: '',
          }));
          setSelectedMaterial(null);
          setMaterialStocks([]);
          setMaterialStocksError(null);
          setWarehouseTouched(false);
          setSelectedWarehouse(null);
          setSelectedLocation(null);
          setStorageLocation('');
          setLocationRequired(false);
        }}
        help={
          TX_TYPE_TIPS[form.type]
            ? { title: '操作类型', purpose: TX_TYPE_TIPS[form.type] }
            : undefined
        }
      />
      {TX_TYPE_NOTICES[form.type] ? (
        <Text style={[styles.operationHint, { color: colors.textSecondary }]}>
          {TX_TYPE_NOTICES[form.type]}
        </Text>
      ) : null}
      {mode === 'in' && (
        <>
          <ChipSelectField
            label="仓库"
            options={inWarehouseOptions.map((warehouse) => ({
              value: warehouse.id,
              label: warehouse.name,
            }))}
            value={selectedWarehouse?.id ?? ''}
            onChange={(key) => {
              setSelectedWarehouse(
                inWarehouseOptions.find((warehouse) => warehouse.id === key) ?? null,
              );
              setSelectedLocation(null);
              setStorageLocation('');
              setLocationRequired(false);
            }}
          />
          <StockLocationField
            label="入库仓位"
            action="stock/in"
            warehouseId={selectedWarehouse?.id}
            value={selectedLocation}
            onChange={setSelectedLocation}
            storageLocation={storageLocation}
            onStorageLocationChange={setStorageLocation}
            showStorageLocationText
            onRequirementChange={setLocationRequired}
          />
          {selectedMaterial && inWarehouseOptions.length === 0 ? (
            <Text style={[styles.inWarehouseHint, { color: colors.error }]}>
              当前无可用仓库：该物料系统分类仅允许
              {getReceiptWarehouseFamilyLabelByMaterialType(selectedMaterialBaseType)}
            </Text>
          ) : null}
        </>
      )}
      <MaterialPickerField<Material>
        label="物料"
        required
        value={selectedMaterial}
        onChange={handleMaterialChange}
        fetchFn={fetchMaterialOptions}
        keyExtractor={(m) => m.id}
        labelExtractor={(m) => m.name}
        sublabelExtractor={(m) => `${m.code}  ·  ${formatUnitLabel(m.unit, unitLabelMap)}`}
        placeholder="搜索或扫码选择物料"
        title="选择物料"
        scannable
        onScanResult={handleScanMaterial}
      />
      {mode === 'in' && batchRequired ? (
        <>
          <ScanInput
            label="批号"
            value={form.batchNo}
            onChangeText={(batchNo) => setForm((current) => ({ ...current, batchNo }))}
            placeholder="扫码或手动输入批号"
            required
            error={inboundBatchError?.includes('批号') ? inboundBatchError : undefined}
          />
          <DatePickerField
            label="生产日期"
            value={form.productionDate || undefined}
            onChange={(productionDate) => setForm((current) => ({ ...current, productionDate }))}
            placeholder="按标签填写，可用于计算有效期"
          />
          <DatePickerField
            label="有效期至"
            value={form.expiryDate || undefined}
            onChange={(expiryDate) => setForm((current) => ({ ...current, expiryDate }))}
            placeholder="有供应商标签时优先填写"
            required={expiryRequired}
            error={inboundBatchError?.includes('保质期') ? inboundBatchError : undefined}
            minimumDate={form.productionDate || undefined}
          />
          {expiryRequired ? (
            <Text style={[styles.inWarehouseHint, { color: colors.textMuted }]}>
              填写供应商有效期优先；未提供时填生产日期，系统按物料保质期计算。
            </Text>
          ) : null}
        </>
      ) : null}
      {mode === 'out' ? (
        <WarehouseCandidateField
          label="仓库"
          required
          value={selectedWarehouse?.id ?? ''}
          onChange={handleWarehouseCandidateChange}
          candidates={warehouseCandidates}
          loading={loadingMaterialStocks}
          disabled={!selectedMaterial}
          unit={formatUnitLabel(selectedMaterial?.unit, unitLabelMap)}
          helperText={selectedMaterial ? '角标 = 可用库存' : undefined}
          emptyText={
            !selectedMaterial
              ? '请先选择物料'
              : materialStocksError
                ? '仓库库存加载失败'
                : '该物料暂无可用库存'
          }
          error={materialStocksError ?? undefined}
        />
      ) : null}
      {mode === 'out' ? (
        <StockLocationField
          label="出库仓位"
          action="stock/out"
          warehouseId={selectedWarehouse?.id}
          value={selectedLocation}
          onChange={setSelectedLocation}
          storageLocation={storageLocation}
          onStorageLocationChange={setStorageLocation}
          showStorageLocationText
          materialId={selectedMaterial?.id}
          minAvailableQty={hasValidQty ? parsedQty : undefined}
          onRequirementChange={setLocationRequired}
        />
      ) : null}
      <ScanInput
        label="关联单据号"
        value={form.referenceNo}
        onChangeText={(t) => setForm((f) => ({ ...f, referenceNo: t }))}
        placeholder="扫码或手动输入单据号"
      />
      {/* 数量 */}
      <QuickNumInput
        label="数量"
        value={form.qty}
        onChangeText={(t) => setForm((f) => ({ ...f, qty: t }))}
        min={1}
        placeholder="请输入数量"
        unit={formatUnitLabel(selectedMaterial?.unit, unitLabelMap)}
        required
        error={qtyError}
        hint={quantityHint}
      />
      {requiredReasonLabel ? (
        <ChipSelectField
          label="操作原因"
          required
          options={reasonOptions}
          value={form.reasonCode}
          onChange={(reasonCode) => setForm((f) => ({ ...f, reasonCode }))}
        />
      ) : null}
      {/* 备注 */}
      <FormField
        label="备注"
        value={form.remarks}
        onChangeText={(t) => setForm((f) => ({ ...f, remarks: t }))}
        placeholder="可补充凭证号、异常说明等明细"
      />
      {/* 照片（仅入库） */}
      {mode === 'in' && <PhotoPicker photos={photos} onPhotosChange={setPhotos} label="上传照片" />}
    </FullScreenModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  operationHint: { fontSize: FontSize.xs, lineHeight: 16, marginTop: -Spacing.xs },
  inWarehouseHint: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
});
