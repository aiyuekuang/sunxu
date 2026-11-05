import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { type Material, materialService } from '../../../host/services';
import { type Warehouse, warehouseService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatQtyWithUnit, formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';
import { StockBalancePreview } from './StockBalancePreview.tsx';
import { type SelectedStockLocation, StockLocationField } from './StockLocationField.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdjustModalProps {
  warehouses: Warehouse[];
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdjustModal({ warehouses, onClose, onSuccess }: AdjustModalProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [saving, setSaving] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    warehouses[0] ?? null,
  );
  const [selectedLocation, setSelectedLocation] = useState<SelectedStockLocation | null>(null);
  const [storageLocation, setStorageLocation] = useState('');
  const [locationRequired, setLocationRequired] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [batchNo, setBatchNo] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [remarks, setRemarks] = useState('');
  const effectiveShelfLifeDays = Number(
    selectedMaterial?.shelfLifeDays ?? selectedMaterial?.family?.defaultShelfLifeDays ?? 0,
  );
  const batchRequired = Boolean(selectedMaterial?.hasBatchTracking || effectiveShelfLifeDays > 0);

  const handleSubmit = async () => {
    if (!selectedWarehouse) {
      toast.error('请选择仓库');
      return;
    }
    if (!selectedMaterial) {
      toast.error('请选择物料');
      return;
    }
    if (batchRequired && !batchNo.trim()) {
      toast.error('该物料已启用批号追踪，请填写或扫描批号');
      return;
    }
    if (locationRequired && !selectedLocation) {
      toast.error('请选择仓位');
      return;
    }
    if (!adjustQty || Number.isNaN(Number(adjustQty)) || Number(adjustQty) === 0) {
      toast.error('请输入有效的差异数量（正为盘盈，负为盘亏）');
      return;
    }
    if (Number(adjustQty) > 0 && effectiveShelfLifeDays > 0 && !productionDate && !expiryDate) {
      toast.error('该物料设置了保质期，请填写生产日期或有效期');
      return;
    }
    setSaving(true);
    try {
      await warehouseService.stockAdjust({
        warehouseId: selectedWarehouse.id,
        locationId: selectedLocation?.id,
        storageLocation: selectedLocation?.pathName || storageLocation.trim() || undefined,
        materialId: selectedMaterial.id,
        batchNo: batchNo.trim() || undefined,
        adjustQty: Number(adjustQty),
        productionDate: Number(adjustQty) > 0 ? productionDate || undefined : undefined,
        expiryDate: Number(adjustQty) > 0 ? expiryDate || undefined : undefined,
        remarks: remarks || undefined,
      });
      toast.success(Number(adjustQty) > 0 ? '盘盈调整成功' : '盘亏调整成功');
      onSuccess();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '差异调整失败');
    } finally {
      setSaving(false);
    }
  };

  const adjustNum = Number(adjustQty);
  const isProfit = !Number.isNaN(adjustNum) && adjustNum > 0;
  const isLoss = !Number.isNaN(adjustNum) && adjustNum < 0;

  return (
    <FullScreenModal
      visible
      onClose={onClose}
      title="库存差异调整"
      confirmText="确认差异调整"
      confirmButtonColor={colors.warning}
      onConfirm={handleSubmit}
      loading={saving}
      avoidKeyboard
    >
      <ChipSelectField
        label="仓库"
        required
        options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
        value={selectedWarehouse?.id ?? ''}
        onChange={(key) => {
          setSelectedWarehouse(warehouses.find((w) => w.id === key) ?? null);
          setSelectedLocation(null);
          setStorageLocation('');
          setBatchNo('');
          setProductionDate('');
          setExpiryDate('');
          setLocationRequired(false);
        }}
      />
      <StockLocationField
        label="调整仓位"
        action="stock/adjust"
        warehouseId={selectedWarehouse?.id}
        value={selectedLocation}
        onChange={setSelectedLocation}
        storageLocation={storageLocation}
        onStorageLocationChange={setStorageLocation}
        showStorageLocationText
        materialId={selectedMaterial?.id}
        minAvailableQty={isLoss ? Math.abs(adjustNum) : undefined}
        onRequirementChange={setLocationRequired}
      />

      <MaterialPickerField<Material>
        label="物料"
        required
        value={selectedMaterial}
        onChange={(material) => {
          setSelectedMaterial(material);
          setSelectedLocation(null);
          setStorageLocation('');
          setBatchNo('');
          setProductionDate('');
          setExpiryDate('');
        }}
        fetchFn={({ page, pageSize, keyword, categoryId }) =>
          materialService.list({
            page,
            pageSize,
            keyword,
            categoryId,
            includeInactive: true,
          })
        }
        keyExtractor={(m) => m.id}
        labelExtractor={(m) => m.name}
        sublabelExtractor={(m) => `${m.code}  ·  ${formatUnitLabel(m.unit, unitLabelMap)}`}
        placeholder="搜索并选择物料"
        title="选择物料"
      />

      {batchRequired ? (
        <ScanInput
          label="批号（必填）"
          value={batchNo}
          onChangeText={setBatchNo}
          placeholder="扫描或输入实际批号"
        />
      ) : null}

      <FormField
        label="调整数量"
        required
        value={adjustQty}
        onChangeText={setAdjustQty}
        placeholder="正数=盘盈，负数=盘亏"
        keyboardType="numbers-and-punctuation"
        containerStyle={styles.formFieldSpacing}
      />
      {isProfit && batchRequired ? (
        <>
          <DatePickerField
            label="生产日期"
            value={productionDate || undefined}
            onChange={setProductionDate}
            placeholder="按实物标签填写，可用于计算有效期"
          />
          <DatePickerField
            label="有效期至"
            value={expiryDate || undefined}
            onChange={setExpiryDate}
            placeholder="有供应商标签时优先填写"
            required={effectiveShelfLifeDays > 0}
            error={
              effectiveShelfLifeDays > 0 && !productionDate && !expiryDate
                ? '请填写生产日期或有效期'
                : undefined
            }
            minimumDate={productionDate || undefined}
          />
          {effectiveShelfLifeDays > 0 ? (
            <Text style={[styles.adjustHint, { color: colors.textMuted }]}>
              填写供应商有效期优先；未提供时填生产日期，系统按物料保质期计算。
            </Text>
          ) : null}
        </>
      ) : null}
      <StockBalancePreview
        warehouseId={selectedWarehouse?.id}
        materialId={selectedMaterial?.id}
        locationId={selectedLocation?.id}
        storageLocation={selectedLocation?.pathName || storageLocation}
        adjustQty={adjustQty.trim() && !Number.isNaN(adjustNum) ? adjustNum : undefined}
      />
      {(isProfit || isLoss) && (
        <View
          style={[
            styles.adjustHint,
            { backgroundColor: isProfit ? colors.successSurface : colors.errorSurface },
          ]}
        >
          <Ionicons
            name={isProfit ? 'trending-up' : 'trending-down'}
            size={14}
            color={isProfit ? colors.success : colors.error}
          />
          <Text
            style={{
              fontSize: FontSize.xs,
              color: isProfit ? colors.success : colors.error,
              fontWeight: '500',
            }}
          >
            {isProfit ? '盘盈 +' : '盘亏 '}
            {formatQtyWithUnit(adjustNum, selectedMaterial?.unit, unitLabelMap)}
          </Text>
        </View>
      )}

      <FormField
        label="备注"
        value={remarks}
        onChangeText={setRemarks}
        placeholder="差异原因说明"
        containerStyle={styles.formFieldSpacing}
      />
    </FullScreenModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  formFieldSpacing: { marginTop: Spacing.sm },
  adjustHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginTop: Spacing.xs,
  },
});
