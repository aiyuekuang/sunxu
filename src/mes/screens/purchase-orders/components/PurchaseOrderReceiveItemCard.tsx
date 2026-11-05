import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { PurchaseReceiptSourcePreviewItemDto } from '../../../types/models/PurchaseReceiptSourcePreviewItemDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { GeneratePurchaseReceiptBatchNoButton } from '../../../components/common/GeneratePurchaseReceiptBatchNoButton.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import { WarehousePickerField } from '../../../components/common/WarehousePickerField.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
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
import {
  getPurchaseOrderReceiveAllocation,
  type PurchaseOrderReceiveDraft,
  parsePurchaseOrderReceiveQty,
} from './purchase-order-receive.ts';

interface PurchaseOrderReceiveItemCardProps {
  item: PurchaseOrderReceiveDraft;
  index: number;
  sourceAllocatedQty: number;
  onUpdate: (patch: Partial<PurchaseOrderReceiveDraft>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  canRemove: boolean;
}

function materialLabel(item: PurchaseReceiptSourcePreviewItemDto): string {
  const material = item.purchaseOrderItem.material;
  return `${material?.name ?? item.purchaseOrderItem.materialId}${
    material?.code ? `（${material.code}）` : ''
  }`;
}

interface ReceiveItemLocationFieldProps {
  item: PurchaseOrderReceiveDraft;
  warehouseId: string;
  onUpdate: (patch: Partial<PurchaseOrderReceiveDraft>) => void;
}

function ReceiveItemLocationField({ item, warehouseId, onUpdate }: ReceiveItemLocationFieldProps) {
  const handleChange = useCallback(
    (location: SelectedStockLocation | null) => onUpdate({ location }),
    [onUpdate],
  );
  const handleStorageLocationChange = useCallback(
    (storageLocation: string) => onUpdate({ storageLocation }),
    [onUpdate],
  );

  return (
    <StockLocationField
      label="入库仓位"
      action="stock/in"
      warehouseId={warehouseId}
      value={item.location}
      onChange={handleChange}
      storageLocation={item.storageLocation}
      onStorageLocationChange={handleStorageLocationChange}
      showStorageLocationText
    />
  );
}

export function PurchaseOrderReceiveItemCard({
  item,
  index,
  sourceAllocatedQty,
  onUpdate,
  onDuplicate,
  onRemove,
  canRemove,
}: PurchaseOrderReceiveItemCardProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const { options: materialGradeOptions } = useDict('material_grade');
  const source = item.source;
  const material = source.purchaseOrderItem.material;
  const shelfLifeDays = getEffectiveMaterialShelfLifeDays(material);
  const batchNoRequired = requiresMaterialBatchNo(material);
  const missingShelfLifeDate = shelfLifeDays > 0 && !item.productionDate && !item.expiryDate;
  const unit = formatUnitLabel(source.receiptUnit, unitLabelMap);
  const currentAllocation = getPurchaseOrderReceiveAllocation(item);
  const lineRemainingCapacity = Math.max(
    source.remainingReceiptCapacityReceiptQty - (sourceAllocatedQty - currentAllocation),
    0,
  );
  const arrivalQty = parsePurchaseOrderReceiveQty(item.arrivalReceiptQty);
  const rejectedQty = parsePurchaseOrderReceiveQty(item.rejectedReceiptQty);
  const pendingInboundQty = Math.max(arrivalQty - rejectedQty, 0);
  const showBatchDates = Boolean(batchNoRequired && pendingInboundQty > 0);
  const arrivalMax = lineRemainingCapacity;
  const rejectedMax = arrivalQty;
  // Only an explicit IQC snapshot may defer warehouse confirmation. Older
  // source-preview responses do not carry this field and must remain safe.
  const requiresWarehouse = pendingInboundQty > 0 && source.incomingInspectionRequired !== true;
  const hasRejectedQty = parsePurchaseOrderReceiveQty(item.rejectedReceiptQty) > 0;

  return (
    <DetailCard
      title={`明细 ${index + 1}${canRemove ? '（拆分）' : ''}`}
      right={
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onDuplicate}
            accessibilityRole="button"
            accessibilityLabel="拆分采购收货明细"
            hitSlop={{ top: Spacing.xs, bottom: Spacing.xs, left: Spacing.xs, right: Spacing.xs }}
          >
            <Ionicons name="copy-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          {canRemove ? (
            <TouchableOpacity
              onPress={onRemove}
              accessibilityRole="button"
              accessibilityLabel="删除拆分明细"
              hitSlop={{ top: Spacing.xs, bottom: Spacing.xs, left: Spacing.xs, right: Spacing.xs }}
            >
              <Ionicons name="close-circle-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          ) : null}
        </View>
      }
    >
      <View style={styles.itemHeader}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{materialLabel(source)}</Text>
        <Text style={[styles.itemHint, { color: colors.textSecondary }]}>
          订单{' '}
          {formatQtyWithUnit(
            source.purchaseOrderItem.orderedQty,
            source.purchaseOrderItem.baseUnit ?? material?.unit,
            unitLabelMap,
          )}{' '}
          · 累计合格入库{' '}
          {formatQtyWithUnit(
            source.purchaseOrderItem.receivedQty,
            source.purchaseOrderItem.baseUnit ?? material?.unit,
            unitLabelMap,
          )}
        </Text>
      </View>
      <Text style={[styles.itemHint, { color: colors.textSecondary }]}>
        合同待收{' '}
        {formatQtyWithUnit(
          source.outstandingQty,
          source.purchaseOrderItem.baseUnit ?? material?.unit,
          unitLabelMap,
        )}{' '}
        · 本次按 {unit} 录入
      </Text>
      <Text style={[styles.itemHint, { color: colors.textSecondary }]}>
        本组已填 {formatQtyWithUnit(sourceAllocatedQty, source.receiptUnit, unitLabelMap)} / 最大{' '}
        {formatQtyWithUnit(
          source.remainingReceiptCapacityReceiptQty,
          source.receiptUnit,
          unitLabelMap,
        )}
      </Text>
      <QuickNumInput
        label="本次实际到货数量"
        value={item.arrivalReceiptQty}
        onChangeText={(value) => onUpdate({ arrivalReceiptQty: value })}
        min={0}
        max={arrivalMax}
        precision={4}
        unit={unit}
        hint="已按后端建议可收数量带入；可按实物到货调整"
      />
      <QuickNumInput
        label="现场拒收数量"
        value={item.rejectedReceiptQty}
        onChangeText={(value) => onUpdate({ rejectedReceiptQty: value })}
        min={0}
        max={rejectedMax}
        precision={4}
        unit={unit}
        hint="拒收数量不得超过本次实际到货；填写后必须填写原因"
        quickButtons={[{ label: '清零', value: 'min' }]}
      />
      <WarehousePickerField
        label={source.incomingInspectionRequired ? '预设合格入库仓（可选）' : '实际入库仓'}
        required={requiresWarehouse}
        value={item.warehouse}
        onChange={(warehouse) =>
          onUpdate({
            warehouse,
            warehouseSource: 'manual',
            location: null,
            storageLocation: '',
            productionDate: '',
            expiryDate: '',
          })
        }
        placeholder="请选择本行实际入库仓"
        clearable
      />
      {item.warehouseSource === 'header' ? (
        <Text style={[styles.itemHint, { color: colors.textSecondary }]}>
          已继承表头默认仓；可按本行实际到货仓调整。
        </Text>
      ) : null}
      {source.incomingInspectionRequired ? (
        <Text style={[styles.itemHint, { color: colors.textSecondary }]}>
          本行命中来料检验，合格入库数量和实际入库仓由质检放行后确认。
        </Text>
      ) : null}
      {hasRejectedQty ? (
        <FormField
          label="拒收原因"
          required
          value={item.rejectReason}
          onChangeText={(value) => onUpdate({ rejectReason: value })}
          placeholder="请填写拒收原因"
        />
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
          materialId={source.purchaseOrderItem.materialId}
          batchNo={item.batchNo}
          onGenerated={(batchNo) => onUpdate({ batchNo })}
        />
      ) : null}
      <ScanInput
        label="系统批号"
        required={Boolean(batchNoRequired && pendingInboundQty > 0)}
        value={item.batchNo}
        onChangeText={(value) => onUpdate({ batchNo: value, productionDate: '', expiryDate: '' })}
        placeholder={batchNoRequired ? '扫码或输入批号' : '选填，可扫码录入'}
      />
      <FormField
        label="供应商批号"
        value={item.supplierBatchNo}
        onChangeText={(value) => onUpdate({ supplierBatchNo: value })}
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
            <Text style={[styles.itemHint, { color: colors.textSecondary }]}>
              填写供应商有效期优先；未提供时填生产日期，系统按物料保质期计算。
            </Text>
          ) : null}
        </>
      ) : null}
      {item.warehouse?.id ? (
        <ReceiveItemLocationField item={item} warehouseId={item.warehouse.id} onUpdate={onUpdate} />
      ) : null}
      <FormField
        label="行备注"
        value={item.remarks}
        onChangeText={(value) => onUpdate({ remarks: value })}
        placeholder="可选"
        multiline
        numberOfLines={2}
      />
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  itemTitle: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  itemHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
