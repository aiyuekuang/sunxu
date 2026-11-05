import { useState } from 'react';
import { SupplierListDto } from '../../../types/models/SupplierListDto';
import { batchService } from '../../../host/services';
import { type Material, materialService } from '../../../host/services';
import { type Supplier, supplierService } from '../../../host/services';
import type { Warehouse } from '../../../host/services';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { WarehousePickerField } from '../../../components/common/WarehousePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateBatchModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateBatchModal({ visible, onClose, onSuccess }: CreateBatchModalProps) {
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [saving, setSaving] = useState(false);
  const [batchNo, setBatchNo] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const resetForm = () => {
    setBatchNo('');
    setProductionDate('');
    setExpiryDate('');
    setSelectedMaterial(null);
    setSelectedWarehouse(null);
    setSelectedSupplier(null);
  };

  const handleSave = async () => {
    if (!selectedMaterial) {
      toast.error('请选择物料');
      return;
    }
    if (!selectedWarehouse) {
      toast.error('请选择仓库');
      return;
    }
    setSaving(true);
    try {
      await batchService.create({
        batchNo: batchNo.trim() || undefined,
        materialId: selectedMaterial.id,
        warehouseId: selectedWarehouse.id,
        supplierId: selectedSupplier?.id || undefined,
        productionDate: productionDate.trim() || undefined,
        expiryDate: expiryDate.trim() || undefined,
      });
      toast.success('批号创建成功');
      resetForm();
      onSuccess();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title="新增"
      confirmText="新增"
      onConfirm={handleSave}
      loading={saving}
      avoidKeyboard
    >
      <ScanInput
        label="批号"
        value={batchNo}
        onChangeText={setBatchNo}
        placeholder="留空自动生成，补数量走入库"
        onScanResult={(code) => {
          setBatchNo(code);
          toast.success(`已扫入批号: ${code}`);
        }}
      />
      <MaterialPickerField<Material>
        label="物料"
        required
        value={selectedMaterial}
        onChange={setSelectedMaterial}
        fetchFn={({ page, pageSize, keyword, categoryId }) =>
          materialService.list({ page, pageSize, keyword, categoryId })
        }
        keyExtractor={(m) => m.id}
        labelExtractor={(m) => m.name}
        sublabelExtractor={(m) => formatUnitLabel(m.unit, unitLabelMap)}
        placeholder="选择物料..."
        title="选择物料"
      />
      <WarehousePickerField
        label="仓库"
        required
        value={selectedWarehouse}
        onChange={setSelectedWarehouse}
        placeholder="选择仓库..."
        title="选择仓库"
      />
      <FormField
        label="数量"
        value="批号建档不增加库存，请在入库或库存盘点中登记数量"
        editable={false}
        multiline
      />
      <EntityPickerField<Supplier>
        label="供应商（可选）"
        value={selectedSupplier}
        onChange={setSelectedSupplier}
        fetchFn={({ page, pageSize, keyword }) =>
          supplierService.list({
            page,
            pageSize,
            keyword,
            status: SupplierListDto.status.ACTIVE,
          })
        }
        keyExtractor={(s) => s.id}
        labelExtractor={(s) => s.name}
        sublabelExtractor={(s) => s.supplierCode}
        placeholder="选择供应商..."
        title="选择供应商"
        clearable
      />
      <DatePickerField
        label="生产日期"
        value={productionDate}
        onChange={setProductionDate}
        placeholder="选择日期"
        clearable
      />
      <DatePickerField
        label="到期日期"
        value={expiryDate}
        onChange={setExpiryDate}
        placeholder="选择日期"
        clearable
      />
    </FullScreenModal>
  );
}
