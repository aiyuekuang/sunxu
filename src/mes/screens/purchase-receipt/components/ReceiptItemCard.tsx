import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BatchListDto } from '../../../types/models/BatchListDto';
import type { Material } from '../../../host/services';
import type { Warehouse } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { CommercialLineFields } from '../../../components/common/CommercialLineFields.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import type { EntityPickerFetchFn } from '../../../../core/components/EntityPickerModal.tsx';
import { ExistingBatchPickerField } from '../../../components/common/ExistingBatchPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { GeneratePurchaseReceiptBatchNoButton } from '../../../components/common/GeneratePurchaseReceiptBatchNoButton.tsx';
import { PickerField, type PickerOption } from '../../../../core/components/PickerField.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import { WarehousePickerField } from '../../../components/common/WarehousePickerField.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import {
  type SelectedStockLocation,
  StockLocationField,
} from '../../warehouse/components/StockLocationField.tsx';
import {
  getEffectiveMaterialShelfLifeDays,
  requiresMaterialBatchNo,
} from '../../../utils/material-batch-requirement';
import { formatQtyWithUnit, formatUnitLabel } from '../../../utils/qty-unit';
import type { SupplierMaterialPickerOption } from '../../../utils/supplier-material-picker';
import { toast } from '../../../../core/toast';

export interface ReceiptDraftItem {
  key: string;
  purchaseOrderItemId?: string;
  sourceOrderedQty?: number;
  sourceReceivedQty?: number;
  sourceOutstandingQty?: number;
  remainingReceiptCapacityReceiptQty?: number;
  capacityReceiptUnit?: string;
  sourceBaseUnit?: string | null;
  sourceOverReceiptPercent?: number;
  /** 创建收货时由后端规则解析并冻结；未返回时 App 不自行推断。 */
  incomingInspectionRequired?: boolean;
  material: Material | null;
  /** 本次实际到货数量，使用本行收货单位。 */
  arrivalReceiptQty: string;
  receiptUnit?: string;
  unitPrice: string;
  supplierMaterialCode?: string;
  /** 实际入库仓；库存、批次和仓位均以此为准。 */
  warehouse: Warehouse | null;
  /** 仅用于表单态，标记本行是否仍随表头默认仓更新。 */
  warehouseSource?: 'header' | 'sourceDefault' | 'manual';
  location: SelectedStockLocation | null;
  storageLocation: string;
  batchNo: string;
  productionDate: string;
  expiryDate: string;
  /** 拒收数量，使用本行收货单位；后端负责换算为基础单位。 */
  rejectedReceiptQty: string;
  rejectReason: string;
  supplierBatchNo: string;
  remarks: string;
  grade?: string | null;
  discountRate?: number | string | null;
  taxRate?: number | string | null;
  priceIncludesTax?: boolean | null;
  supplierPriceTierId?: string | null;
}

export function newReceiptDraftItem(defaultWarehouse: Warehouse | null = null): ReceiptDraftItem {
  return {
    key: String(Date.now() + Math.random()),
    purchaseOrderItemId: undefined,
    material: null,
    arrivalReceiptQty: '',
    receiptUnit: '',
    unitPrice: '',
    supplierMaterialCode: '',
    warehouse: defaultWarehouse,
    warehouseSource: defaultWarehouse ? 'header' : undefined,
    location: null,
    storageLocation: '',
    batchNo: '',
    productionDate: '',
    expiryDate: '',
    rejectedReceiptQty: '',
    rejectReason: '',
    supplierBatchNo: '',
    remarks: '',
    grade: undefined,
    discountRate: '',
    taxRate: undefined,
    priceIncludesTax: undefined,
    supplierPriceTierId: undefined,
  };
}

interface ReceiptItemCardProps {
  item: ReceiptDraftItem;
  index: number;
  sourceLocked?: boolean;
  showRemove: boolean;
  onRemove: () => void;
  onUpdate: (patch: Partial<ReceiptDraftItem>) => void;
  materialValue: SupplierMaterialPickerOption | null;
  fetchMaterialOptions: EntityPickerFetchFn<SupplierMaterialPickerOption>;
  materialPlaceholder: string;
  unitOptions: PickerOption[];
  onMaterialChange: (option: SupplierMaterialPickerOption | null) => void;
  onScanMaterial: (barcode: string) => void;
  arrivalQtyError?: string;
  rejectedQtyError?: string;
  rejectReasonError?: string;
  warehouseError?: string;
  batchError?: string;
}

export const ReceiptItemCard = React.memo(function ReceiptItemCard({
  item,
  index,
  sourceLocked = false,
  showRemove,
  onRemove,
  onUpdate,
  materialValue,
  fetchMaterialOptions,
  materialPlaceholder,
  unitOptions,
  onMaterialChange,
  onScanMaterial,
  arrivalQtyError,
  rejectedQtyError,
  rejectReasonError,
  warehouseError,
  batchError,
}: ReceiptItemCardProps) {
  const { colors } = useTheme();
  const { permitted: canViewPrices } = useAmountDisplay();
  const { options: materialGradeOptions } = useDict('material_grade');
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const sourceBaseUnit = item.sourceBaseUnit ?? item.material?.unit;
  const capacityReceiptUnit = item.capacityReceiptUnit ?? item.receiptUnit;
  const arrivalReceiptQty = Number(item.arrivalReceiptQty);
  const rejectedReceiptQty = Number(item.rejectedReceiptQty);
  const pendingInboundQty = Math.max(arrivalReceiptQty - rejectedReceiptQty, 0);
  const requiresWarehouse = pendingInboundQty > 0 && item.incomingInspectionRequired !== true;
  const shelfLifeDays = getEffectiveMaterialShelfLifeDays(item.material);
  const batchNoRequired = requiresMaterialBatchNo(item.material);
  const showBatchDates = Boolean(batchNoRequired && pendingInboundQty > 0);
  const missingShelfLifeDate = shelfLifeDays > 0 && !item.productionDate && !item.expiryDate;
  const handleBatchNoChange = (nextBatchNo: string) => {
    if (nextBatchNo === item.batchNo) return;
    const hadBatchDates = Boolean(item.productionDate || item.expiryDate);
    onUpdate({ batchNo: nextBatchNo, productionDate: '', expiryDate: '' });
    if (hadBatchDates) {
      toast.info('批号已变更，生产日期和有效期已清空');
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.indexLabel, { color: colors.textSecondary }]}>第 {index + 1} 行</Text>
        {showRemove && (
          <TouchableOpacity onPress={onRemove}>
            <Ionicons name="close-circle-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      <MaterialPickerField<SupplierMaterialPickerOption>
        label="物料"
        value={materialValue}
        onChange={onMaterialChange}
        fetchFn={fetchMaterialOptions}
        materialExtractor={(option) => option.material}
        keyExtractor={(option) => option.id}
        labelExtractor={(option) => option.label}
        sublabelExtractor={(option) => option.sublabel}
        placeholder={sourceLocked ? '采购订单明细已锁定' : materialPlaceholder}
        scannable
        onScanResult={onScanMaterial}
        clearable
        disabled={sourceLocked}
        disabledReason={sourceLocked ? '已关联采购订单，物料不可修改' : undefined}
      />

      {item.supplierMaterialCode && (
        <Text style={[styles.supplierMaterialText, { color: colors.textSecondary }]}>
          供应商料号: {item.supplierMaterialCode}
        </Text>
      )}

      {item.purchaseOrderItemId && item.remainingReceiptCapacityReceiptQty !== undefined ? (
        <>
          <Text style={[styles.capacityHint, { color: colors.textSecondary }]}>
            订单 {formatQtyWithUnit(item.sourceOrderedQty ?? 0, sourceBaseUnit, unitLabelMap)} ·
            累计合格入库{' '}
            {formatQtyWithUnit(item.sourceReceivedQty ?? 0, sourceBaseUnit, unitLabelMap)}
          </Text>
          <Text style={[styles.capacityHint, { color: colors.textSecondary }]}>
            合同待收{' '}
            {formatQtyWithUnit(item.sourceOutstandingQty ?? 0, sourceBaseUnit, unitLabelMap)} · 最大{' '}
            {formatQtyWithUnit(
              item.remainingReceiptCapacityReceiptQty,
              capacityReceiptUnit,
              unitLabelMap,
            )}
            {Number(item.sourceOverReceiptPercent ?? 0) > 0
              ? `（含超收容差 ${item.sourceOverReceiptPercent}%）`
              : ''}
          </Text>
        </>
      ) : null}

      <View style={styles.rowInputs}>
        <View style={styles.inputWrap}>
          <FormField
            label="本次实际到货数量"
            required
            error={arrivalQtyError}
            value={item.arrivalReceiptQty}
            onChangeText={(v) => onUpdate({ arrivalReceiptQty: v })}
            placeholder="0"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.unitInputWrap}>
          <PickerField
            label={item.purchaseOrderItemId ? '收货单位（继承订单）' : '收货单位'}
            value={item.receiptUnit ?? ''}
            options={unitOptions}
            onChange={(receiptUnit) => onUpdate({ receiptUnit })}
            placeholder={
              formatUnitLabel(
                item.material?.defaultPurchaseUnit || item.material?.unit,
                unitLabelMap,
              ) || '基础单位'
            }
            disabled={Boolean(item.purchaseOrderItemId)}
          />
        </View>
      </View>
      <View style={styles.rowInputs}>
        <View style={styles.inputWrap}>
          <FormField
            label="现场拒收数量（收货单位）"
            error={rejectedQtyError}
            value={item.rejectedReceiptQty}
            onChangeText={(v) => onUpdate({ rejectedReceiptQty: v })}
            placeholder="0"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.inputWrap}>
          <FormField
            label="拒收原因"
            required={Number(item.rejectedReceiptQty) > 0}
            error={rejectReasonError}
            value={item.rejectReason}
            onChangeText={(v) => onUpdate({ rejectReason: v })}
            placeholder="有拒收数量时必填"
            maxLength={256}
          />
        </View>
      </View>
      {item.purchaseOrderItemId && (
        <Text style={[styles.unitHint, { color: colors.textSecondary }]}>
          收货单位继承采购订单；如需变更，请先调整采购订单。
        </Text>
      )}
      {item.material?.unit && item.receiptUnit && item.receiptUnit !== item.material.unit && (
        <Text style={[styles.unitHint, { color: colors.textSecondary }]}>
          库存基础单位: {formatUnitLabel(item.material.unit, unitLabelMap)}
        </Text>
      )}

      {canViewPrices && (
        <>
          <CommercialLineFields
            value={{
              quantity: item.arrivalReceiptQty,
              unitPrice: item.unitPrice,
              discountRate: item.discountRate,
              taxRate: item.taxRate,
              priceIncludesTax: item.priceIncludesTax,
            }}
            onChange={(patch) => {
              const nextPatch: Partial<ReceiptDraftItem> = {};
              if (Object.hasOwn(patch, 'unitPrice')) {
                nextPatch.unitPrice =
                  patch.unitPrice === null || patch.unitPrice === undefined
                    ? ''
                    : String(patch.unitPrice);
              }
              if (Object.hasOwn(patch, 'discountRate')) {
                nextPatch.discountRate = patch.discountRate;
              }
              if (Object.hasOwn(patch, 'taxRate')) {
                nextPatch.taxRate = patch.taxRate;
              }
              if (Object.hasOwn(patch, 'priceIncludesTax')) {
                nextPatch.priceIncludesTax = patch.priceIncludesTax;
              }
              onUpdate(nextPatch);
            }}
          />
          <Text style={[styles.unitHint, { color: colors.textSecondary }]}>
            到货金额仅供核对，最终应付以合格入库数量为准。
          </Text>
        </>
      )}

      <WarehousePickerField
        label={item.incomingInspectionRequired ? '预设合格入库仓（可选）' : '实际入库仓'}
        required={requiresWarehouse}
        value={item.warehouse}
        onChange={(warehouse) =>
          onUpdate({
            warehouse,
            warehouseSource: 'manual',
            location: null,
            storageLocation: '',
            batchNo: '',
            productionDate: '',
            expiryDate: '',
          })
        }
        placeholder="请选择本行实际入库仓"
        clearable
        error={warehouseError}
      />
      {item.warehouseSource === 'header' ? (
        <Text style={[styles.unitHint, { color: colors.textSecondary }]}>
          已继承表头默认仓；可按本行实际到货仓调整。
        </Text>
      ) : null}
      {item.warehouseSource === 'sourceDefault' ? (
        <Text style={[styles.unitHint, { color: colors.textSecondary }]}>
          已从物料主档默认仓带出；可按本行实际到货仓调整。
        </Text>
      ) : null}
      {item.incomingInspectionRequired ? (
        <Text style={[styles.unitHint, { color: colors.textSecondary }]}>
          本行命中来料检验，合格入库数量和实际入库仓由质检放行后确认。
        </Text>
      ) : null}

      <PickerField
        label="入库品质等级"
        value={item.grade ?? ''}
        options={materialGradeOptions}
        onChange={(value) => onUpdate({ grade: value || undefined })}
        placeholder="按策略选择"
        clearable
      />

      {batchNoRequired && pendingInboundQty > 0 ? (
        <GeneratePurchaseReceiptBatchNoButton
          materialId={item.material?.id ?? ''}
          batchNo={item.batchNo}
          onGenerated={(batchNo) => onUpdate({ batchNo })}
        />
      ) : null}
      <ScanInput
        label="系统入库批号"
        required={Boolean(batchNoRequired && pendingInboundQty > 0)}
        value={item.batchNo}
        onChangeText={handleBatchNoChange}
        placeholder="扫码或手动输入"
        error={batchError}
      />
      <ExistingBatchPickerField
        presentation="action"
        actionLabel="选择已有批号（补数量时更快）"
        materialId={item.material?.id ?? null}
        warehouseId={item.warehouse?.id ?? null}
        value={item.batchNo}
        onChangeBatchNo={(batchNo) => onUpdate({ batchNo })}
        onSelectBatch={(batch) =>
          onUpdate({
            productionDate: batch?.productionDate ?? '',
            expiryDate: batch?.expiryDate ?? '',
          })
        }
        mode="inbound"
        sourceDocType={BatchListDto.sourceDocType.PURCHASE_RECEIPT}
      />

      {item.warehouse?.id ? (
        <StockLocationField
          label="入库仓位"
          action="stock/in"
          warehouseId={item.warehouse.id}
          value={item.location}
          onChange={(location) => onUpdate({ location })}
          storageLocation={item.storageLocation}
          onStorageLocationChange={(storageLocation) => onUpdate({ storageLocation })}
          showStorageLocationText
        />
      ) : null}

      <FormField
        label="供应商原始批号"
        value={item.supplierBatchNo}
        onChangeText={(v) => onUpdate({ supplierBatchNo: v })}
        placeholder="可选"
      />
      {showBatchDates ? (
        <>
          <DatePickerField
            label="生产日期"
            value={item.productionDate || undefined}
            onChange={(productionDate) => onUpdate({ productionDate })}
            placeholder="按供应商标签填写"
          />
          <DatePickerField
            label="有效期至"
            value={item.expiryDate || undefined}
            onChange={(expiryDate) => onUpdate({ expiryDate })}
            placeholder="有标签时优先填写"
            error={missingShelfLifeDate ? '请填写生产日期或有效期' : undefined}
            minimumDate={item.productionDate || undefined}
          />
          {shelfLifeDays > 0 ? (
            <Text style={[styles.unitHint, { color: colors.textSecondary }]}>
              填写供应商有效期优先；未提供时填生产日期，系统按物料保质期计算。
            </Text>
          ) : null}
        </>
      ) : null}

      <FormField
        label="备注"
        value={item.remarks}
        onChangeText={(v) => onUpdate({ remarks: v })}
        placeholder="备注（可选）"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
    borderWidth: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indexLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  inputWrap: {
    flex: 1,
  },
  unitInputWrap: {
    width: 96,
  },
  supplierMaterialText: {
    fontSize: FontSize.xs,
  },
  capacityHint: {
    fontSize: FontSize.xs,
  },
  unitHint: {
    fontSize: FontSize.xs,
  },
});
