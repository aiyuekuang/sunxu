import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StockCountLineInputDto } from '../../../types/models/StockCountLineInputDto';
import type { Customer } from '../../../host/services';
import { customerService } from '../../../host/services';
import type { Material } from '../../../host/services';
import { materialService } from '../../../host/services';
import type { Supplier } from '../../../host/services';
import { supplierService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import type { EntityPickerFetchFn } from '../../../../core/components/EntityPickerModal.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import {
  buildCustomFieldFormPayload,
  CustomFieldFormSection,
  validateCustomFields,
} from '../../../components/custom-fields/CustomFieldFormSection.tsx';
import { useCustomFieldSchema } from '../../../components/custom-fields/useCustomFieldSchema.ts';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import {
  type SelectedStockLocation,
  StockLocationField,
} from '../../warehouse/components/StockLocationField.tsx';

interface StockCountLineEditorSheetProps {
  visible: boolean;
  warehouseId: string;
  hasFixedLocation: boolean;
  loading: boolean;
  onClose: () => void;
  onSave: (line: StockCountLineInputDto) => void;
}

export function StockCountLineEditorSheet({
  visible,
  warehouseId,
  hasFixedLocation,
  loading,
  onClose,
  onSave,
}: StockCountLineEditorSheetProps) {
  const { colors } = useTheme();
  const schema = useCustomFieldSchema('stock_count_line');
  const [material, setMaterial] = useState<Material | null>(null);
  const [ownerType, setOwnerType] = useState<StockCountLineInputDto.ownerType | ''>('');
  const [customerOwner, setCustomerOwner] = useState<Customer | null>(null);
  const [supplierOwner, setSupplierOwner] = useState<Supplier | null>(null);
  const [location, setLocation] = useState<SelectedStockLocation | null>(null);
  const [locationRequired, setLocationRequired] = useState(!hasFixedLocation);
  const [storageLocation, setStorageLocation] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({});
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});

  const fetchMaterials: EntityPickerFetchFn<Material> = useCallback(
    (params) => materialService.list({ ...params, isActive: true }),
    [],
  );

  const fetchCustomers: EntityPickerFetchFn<Customer> = useCallback(
    (params) => customerService.list(params),
    [],
  );

  const fetchSuppliers: EntityPickerFetchFn<Supplier> = useCallback(
    (params) => supplierService.list(params),
    [],
  );

  const handleCustomFieldChange = useCallback((key: string, value: unknown) => {
    setCustomValues((previous) => ({ ...previous, [key]: value }));
    setCustomFieldErrors((previous) => {
      if (!(key in previous)) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }, []);

  const handleSave = () => {
    if (!material) return;
    if (!ownerType) return;
    if (ownerType === StockCountLineInputDto.ownerType.CUSTOMER && !customerOwner) {
      return;
    }
    if (ownerType === StockCountLineInputDto.ownerType.SUPPLIER && !supplierOwner) {
      return;
    }
    if (material.hasBatchTracking && !batchNo.trim()) return;
    if (locationRequired && !location) return;
    if (schema.loading || schema.loadError || schema.schemaVersion === null) return;

    const nextCustomFieldErrors = validateCustomFields(schema.fields, customValues, 'create');
    setCustomFieldErrors(nextCustomFieldErrors);
    if (Object.keys(nextCustomFieldErrors).length > 0) return;

    const customFieldPayload = buildCustomFieldFormPayload(
      schema.fields,
      schema.schemaVersion,
      customValues,
    );
    onSave({
      materialId: material.id,
      ownerType,
      ownerRefId:
        ownerType === StockCountLineInputDto.ownerType.CUSTOMER
          ? customerOwner?.id
          : ownerType === StockCountLineInputDto.ownerType.SUPPLIER
            ? supplierOwner?.id
            : undefined,
      locationId: location?.id,
      storageLocation: storageLocation.trim() || undefined,
      batchNo: batchNo.trim() || undefined,
      remarks: remarks.trim() || undefined,
      ...customFieldPayload,
    });
  };

  const canSave =
    material !== null &&
    ownerType !== '' &&
    (ownerType !== StockCountLineInputDto.ownerType.CUSTOMER || customerOwner !== null) &&
    (ownerType !== StockCountLineInputDto.ownerType.SUPPLIER || supplierOwner !== null) &&
    (!material.hasBatchTracking || batchNo.trim().length > 0) &&
    (!locationRequired || location !== null) &&
    !schema.loading &&
    !schema.loadError &&
    schema.schemaVersion !== null;
  const confirmDisabledHint = schema.loadError
    ? '自定义字段读取失败，请关闭后重试'
    : schema.loading
      ? '正在读取盘点行设置'
      : schema.schemaVersion === null
        ? '盘点行设置未就绪，请关闭后重试'
        : !material
          ? '请选择物料'
          : !ownerType
            ? '请选择库存货主'
            : ownerType === StockCountLineInputDto.ownerType.CUSTOMER && !customerOwner
              ? '请选择客户货主'
              : ownerType === StockCountLineInputDto.ownerType.SUPPLIER && !supplierOwner
                ? '请选择供应商货主'
                : material.hasBatchTracking && !batchNo.trim()
                  ? '请输入该物料的批号'
                  : '请完成必填仓位或自定义字段';

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="添加盘点行"
      subtitle="请选择库存货主，盘点差异将记入该货主的库存账。"
      confirmText="保存盘点行"
      onConfirm={handleSave}
      loading={loading}
      disabled={!canSave}
      confirmDisabledHint={confirmDisabledHint}
      closeDisabled={loading}
      avoidKeyboard
      maxHeightRatio={0.9}
    >
      <MaterialPickerField<Material>
        label="物料"
        required
        value={material}
        onChange={(next) => {
          setMaterial(next);
          setBatchNo('');
        }}
        fetchFn={fetchMaterials}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => item.name}
        sublabelExtractor={(item) => item.spec ?? ''}
        title="选择盘点物料"
        placeholder="搜索物料编码或名称"
        clearable
      />

      <ChipSelectField
        label="库存货主"
        required
        options={[
          {
            value: StockCountLineInputDto.ownerType.COMPANY,
            label: '公司库存',
          },
          {
            value: StockCountLineInputDto.ownerType.CUSTOMER,
            label: '客户库存',
          },
          {
            value: StockCountLineInputDto.ownerType.SUPPLIER,
            label: '供应商库存',
          },
        ]}
        value={ownerType}
        onChange={(value) => {
          const nextOwnerType =
            value === StockCountLineInputDto.ownerType.COMPANY
              ? StockCountLineInputDto.ownerType.COMPANY
              : value === StockCountLineInputDto.ownerType.CUSTOMER
                ? StockCountLineInputDto.ownerType.CUSTOMER
                : value === StockCountLineInputDto.ownerType.SUPPLIER
                  ? StockCountLineInputDto.ownerType.SUPPLIER
                  : '';
          setOwnerType(nextOwnerType);
          setCustomerOwner(null);
          setSupplierOwner(null);
        }}
      />
      {ownerType === StockCountLineInputDto.ownerType.CUSTOMER ? (
        <EntityPickerField<Customer>
          label="客户货主"
          required
          value={customerOwner}
          onChange={setCustomerOwner}
          fetchFn={fetchCustomers}
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => item.name}
          sublabelExtractor={(item) => item.customerCode}
          title="选择客户货主"
          placeholder="搜索客户"
          clearable
        />
      ) : null}
      {ownerType === StockCountLineInputDto.ownerType.SUPPLIER ? (
        <EntityPickerField<Supplier>
          label="供应商货主"
          required
          value={supplierOwner}
          onChange={setSupplierOwner}
          fetchFn={fetchSuppliers}
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => item.name}
          sublabelExtractor={(item) => item.supplierCode}
          title="选择供应商货主"
          placeholder="搜索供应商"
          clearable
        />
      ) : null}

      {!hasFixedLocation ? (
        <StockLocationField
          label="仓位"
          action="count"
          warehouseId={warehouseId}
          value={location}
          onChange={setLocation}
          storageLocation={storageLocation}
          onStorageLocationChange={setStorageLocation}
          showStorageLocationText
          onRequirementChange={setLocationRequired}
        />
      ) : null}

      <ScanInput
        label="批号"
        required={Boolean(material?.hasBatchTracking)}
        value={batchNo}
        onChangeText={setBatchNo}
        placeholder={material?.hasBatchTracking ? '扫码或输入批号' : '选填，可扫码录入'}
        maxLength={128}
      />
      <FormField
        label="行备注"
        value={remarks}
        onChangeText={setRemarks}
        placeholder="选填"
        maxLength={512}
      />

      <CustomFieldFormSection
        fields={schema.fields}
        values={customValues}
        errors={customFieldErrors}
        mode="create"
        onChange={handleCustomFieldChange}
        loading={schema.loading}
        loadError={schema.loadError}
        title="盘点行自定义字段"
      />

      <View style={[styles.warning, { backgroundColor: colors.warningSurface }]}>
        <Text style={[styles.warningText, { color: colors.warning }]}>
          保存后会刷新整张单的账面快照，并清空已录入的实盘数量；请完成维护后重新盘点。
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  warning: {
    padding: Spacing.sm,
    borderRadius: Spacing.xs,
  },
  warningText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
