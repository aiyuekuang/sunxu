import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { type Material, materialService } from '../../../host/services';
import {
  type Warehouse,
  WarehouseLocationControlMode,
  warehouseService,
} from '../../../host/services';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { OPERATION_FEATURE as F, hasVisibleFeature } from '../../../host/authorization';
import { Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useAuthStore } from '../../../host/state/auth.store';
import { formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';
import { type SelectedStockLocation, StockLocationField } from './StockLocationField.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TransferModalProps {
  warehouses: Warehouse[];
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TransferModal({ warehouses, onClose, onSuccess }: TransferModalProps) {
  const operationConfig = useAuthStore((state) => state.operationConfig);
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const locationFeatureEnabled = hasVisibleFeature(operationConfig, F.INVENTORY_LOCATION_CONTROL);
  const [saving, setSaving] = useState(false);
  const [fromWarehouse, setFromWarehouse] = useState<Warehouse | null>(warehouses[0] ?? null);
  const [toWarehouse, setToWarehouse] = useState<Warehouse | null>(null);
  const [fromLocation, setFromLocation] = useState<SelectedStockLocation | null>(null);
  const [toLocation, setToLocation] = useState<SelectedStockLocation | null>(null);
  const [fromStorageLocation, setFromStorageLocation] = useState('');
  const [toStorageLocation, setToStorageLocation] = useState('');
  const [fromLocationRequired, setFromLocationRequired] = useState(false);
  const [toLocationRequired, setToLocationRequired] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [qty, setQty] = useState('');
  const [remarks, setRemarks] = useState('');

  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: w.name }));

  const handleSubmit = async () => {
    if (!fromWarehouse) {
      toast.error('请选择调出仓库');
      return;
    }
    if (!toWarehouse) {
      toast.error('请选择调入仓库');
      return;
    }
    if (!locationFeatureEnabled && fromWarehouse.id === toWarehouse.id) {
      toast.error('未启用仓位管理时不能做同仓仓位移动，请选择不同仓库');
      return;
    }
    if (
      fromWarehouse.id === toWarehouse.id &&
      fromWarehouse.locationControlMode === WarehouseLocationControlMode.NONE
    ) {
      toast.error('当前仓库未启用仓位管控，不能做同仓仓位移动');
      return;
    }
    if (fromWarehouse.id === toWarehouse.id && (!fromLocation || !toLocation)) {
      toast.error('同仓调拨请选择来源仓位和目标仓位');
      return;
    }
    if (fromWarehouse.id === toWarehouse.id && fromLocation?.id === toLocation?.id) {
      toast.error('同仓调拨的来源仓位和目标仓位不能相同');
      return;
    }
    if (fromLocationRequired && !fromLocation) {
      toast.error('请选择来源仓位');
      return;
    }
    if (toLocationRequired && !toLocation) {
      toast.error('请选择目标仓位');
      return;
    }
    if (!selectedMaterial) {
      toast.error('请选择物料');
      return;
    }
    if (!qty || Number.isNaN(Number(qty)) || Number(qty) <= 0) {
      toast.error('请输入有效数量');
      return;
    }
    setSaving(true);
    try {
      await warehouseService.stockTransfer({
        fromWarehouseId: fromWarehouse.id,
        toWarehouseId: toWarehouse.id,
        fromLocationId: fromLocation?.id,
        toLocationId: toLocation?.id,
        fromStorageLocation: fromLocation?.pathName || fromStorageLocation.trim() || undefined,
        toStorageLocation: toLocation?.pathName || toStorageLocation.trim() || undefined,
        materialId: selectedMaterial.id,
        qty: Number(qty),
        remarks: remarks || undefined,
      });
      toast.success('调拨成功');
      onSuccess();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '调拨失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible
      onClose={onClose}
      title="库存调拨"
      confirmText="确认调拨"
      onConfirm={handleSubmit}
      loading={saving}
      avoidKeyboard
    >
      <ChipSelectField
        label="调出仓库"
        required
        options={warehouseOptions}
        value={fromWarehouse?.id ?? ''}
        onChange={(key) => {
          setFromWarehouse(warehouses.find((w) => w.id === key) ?? null);
          setFromLocation(null);
          setFromStorageLocation('');
          setFromLocationRequired(false);
        }}
      />
      <StockLocationField
        label="来源仓位"
        action="stock/transfer-out"
        warehouseId={fromWarehouse?.id}
        value={fromLocation}
        onChange={setFromLocation}
        storageLocation={fromStorageLocation}
        onStorageLocationChange={setFromStorageLocation}
        showStorageLocationText
        materialId={selectedMaterial?.id}
        minAvailableQty={Number(qty) > 0 ? Number(qty) : undefined}
        onRequirementChange={setFromLocationRequired}
      />
      <ChipSelectField
        label="调入仓库"
        required
        options={warehouseOptions}
        value={toWarehouse?.id ?? ''}
        onChange={(key) => {
          setToWarehouse(warehouses.find((w) => w.id === key) ?? null);
          setToLocation(null);
          setToStorageLocation('');
          setToLocationRequired(false);
        }}
      />
      <StockLocationField
        label="目标仓位"
        action="stock/transfer-in"
        warehouseId={toWarehouse?.id}
        value={toLocation}
        onChange={setToLocation}
        storageLocation={toStorageLocation}
        onStorageLocationChange={setToStorageLocation}
        showStorageLocationText
        onRequirementChange={setToLocationRequired}
      />

      <MaterialPickerField<Material>
        label="物料"
        required
        value={selectedMaterial}
        onChange={(material) => {
          setSelectedMaterial(material);
          setFromLocation(null);
          setFromStorageLocation('');
          setToLocation(null);
          setToStorageLocation('');
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

      <QuickNumInput
        label="调拨数量"
        value={qty}
        onChangeText={setQty}
        min={1}
        placeholder="请输入调拨数量"
        unit={formatUnitLabel(selectedMaterial?.unit, unitLabelMap)}
        required
      />

      <FormField
        label="备注"
        value={remarks}
        onChangeText={setRemarks}
        placeholder="可选"
        containerStyle={styles.formFieldSpacing}
      />
    </FullScreenModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  formFieldSpacing: { marginTop: Spacing.sm },
});
