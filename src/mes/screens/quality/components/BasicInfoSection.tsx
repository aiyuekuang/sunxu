import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { type Customer, customerService } from '../../../host/services';
import { type Material, materialService } from '../../../host/services';
import type { InspectionType } from '../../../host/services';
import { type Supplier, supplierService } from '../../../host/services';
import { userService } from '../../../host/services';
import { type WorkOrder, workOrderService } from '../../../host/services';
import { CustomerListDto } from '../../../types/models/CustomerListDto';
import { SupplierListDto } from '../../../types/models/SupplierListDto';
import type { SimpleUser } from '../../../host/api-types';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatUnitLabel } from '../../../utils/qty-unit';
import { INSPECTION_TYPE_TIPS, TYPE_OPTIONS } from './inspection-utils.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BasicInfoSectionProps {
  type: InspectionType;
  remarks: string;
  batchNo: string;
  onTypeChange: (type: InspectionType) => void;
  onRemarksChange: (text: string) => void;
  onBatchNoChange: (text: string) => void;
  selectedMaterial: Material | null;
  onMaterialChange: (m: Material | null) => void;
  selectedWorkOrder: WorkOrder | null;
  onWorkOrderChange: (wo: WorkOrder | null) => void;
  selectedInspector: SimpleUser | null;
  onInspectorChange: (u: SimpleUser | null) => void;
  selectedSupplier: Supplier | null;
  onSupplierChange: (s: Supplier | null) => void;
  selectedCustomer: Customer | null;
  onCustomerChange: (c: Customer | null) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BasicInfoSection({
  type,
  remarks,
  batchNo,
  onTypeChange,
  onRemarksChange,
  onBatchNoChange,
  selectedMaterial,
  onMaterialChange,
  selectedWorkOrder,
  onWorkOrderChange,
  selectedInspector,
  onInspectorChange,
  selectedSupplier,
  onSupplierChange,
  selectedCustomer,
  onCustomerChange,
}: BasicInfoSectionProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');

  const fetchMaterials = useCallback(
    (p: { page: number; pageSize: number; keyword?: string }) => materialService.list(p),
    [],
  );
  const fetchWorkOrders = useCallback(
    (p: { page: number; pageSize: number; keyword?: string }) => workOrderService.list(p),
    [],
  );
  const fetchInspectors = useCallback(
    async (p: { page: number; pageSize: number; keyword?: string }) => {
      const list = await userService.simpleList(p.keyword || undefined);
      return { list: list as SimpleUser[], total: list.length };
    },
    [],
  );
  const fetchSuppliers = useCallback(
    (p: { page: number; pageSize: number; keyword?: string }) =>
      supplierService.list({ ...p, status: SupplierListDto.status.ACTIVE }),
    [],
  );
  const fetchCustomers = useCallback(
    (p: { page: number; pageSize: number; keyword?: string }) =>
      customerService.list({ ...p, status: CustomerListDto.status.ACTIVE }),
    [],
  );

  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>基础信息</Text>

      <ChipSelectField
        label="检验类型"
        required
        options={TYPE_OPTIONS}
        value={type}
        onChange={(v) => onTypeChange(v as InspectionType)}
        help={{
          title: '检验类型',
          purpose: INSPECTION_TYPE_TIPS[type] ?? '选择当前质检单对应的检验环节。',
        }}
      />

      <MaterialPickerField<Material>
        label="检验物料"
        required
        value={selectedMaterial}
        onChange={onMaterialChange}
        fetchFn={fetchMaterials}
        keyExtractor={(m) => m.id}
        labelExtractor={(m) => m.name}
        sublabelExtractor={(m) => formatUnitLabel(m.unit, unitLabelMap)}
        placeholder="选择物料"
        clearable={false}
      />

      <EntityPickerField
        label="关联工单（可选）"
        value={selectedWorkOrder}
        onChange={onWorkOrderChange}
        fetchFn={fetchWorkOrders}
        keyExtractor={(wo) => wo.id}
        labelExtractor={(wo) => `${wo.orderNo}${wo.material?.name ? ` - ${wo.material.name}` : ''}`}
        sublabelExtractor={(wo) => wo.material?.name ?? ''}
        placeholder="选择工单（可选）"
        clearable
      />

      <EntityPickerField
        label="质检员（可选）"
        value={selectedInspector}
        onChange={onInspectorChange}
        fetchFn={fetchInspectors}
        keyExtractor={(u) => u.id}
        labelExtractor={(u) => u.realName || u.username}
        sublabelExtractor={(u) => (u.realName ? `@${u.username}` : '')}
        placeholder="选择质检员（可选）"
        clearable
      />

      <ScanInput
        label="批号（可选）"
        value={batchNo}
        onChangeText={onBatchNoChange}
        placeholder="扫描或输入批号"
      />

      {type === 'iqc' && (
        <EntityPickerField<Supplier>
          label="供应商（IQC 可选）"
          value={selectedSupplier}
          onChange={onSupplierChange}
          fetchFn={fetchSuppliers}
          keyExtractor={(s) => s.id}
          labelExtractor={(s) => s.name}
          sublabelExtractor={(s) => s.supplierCode}
          placeholder="选择供应商"
          clearable
        />
      )}

      {(type === 'fqc' || type === 'oqc') && (
        <EntityPickerField<Customer>
          label="客户（FQC/OQC 可选）"
          value={selectedCustomer}
          onChange={onCustomerChange}
          fetchFn={fetchCustomers}
          keyExtractor={(c) => c.id}
          labelExtractor={(c) => c.name}
          sublabelExtractor={(c) => c.customerCode}
          placeholder="选择客户"
          clearable
        />
      )}

      <FormField
        label="备注"
        value={remarks}
        onChangeText={onRemarksChange}
        placeholder="可选"
        multiline
        numberOfLines={3}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '600' },
});
