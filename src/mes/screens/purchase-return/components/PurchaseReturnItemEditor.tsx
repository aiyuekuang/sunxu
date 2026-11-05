import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { Material } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import type { EntityPickerFetchFn } from '../../../../core/components/EntityPickerModal.tsx';
import { ExistingBatchPickerField } from '../../../components/common/ExistingBatchPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { CustomFieldFormSection } from '../../../components/custom-fields/CustomFieldFormSection.tsx';
import type { CustomFieldSchemaState } from '../../../components/custom-fields/useCustomFieldSchema.ts';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import { StockBalancePreview } from '../../warehouse/components/StockBalancePreview.tsx';
import type { SelectedStockLocation } from '../../warehouse/components/StockLocationField.tsx';
import { StockLocationField } from '../../warehouse/components/StockLocationField.tsx';
import { formatUnitLabel } from '../../../utils/qty-unit';

export interface PurchaseReturnDraftItem {
  key: string;
  id?: string;
  material: Material | null;
  returnQty: string;
  unitPrice: string;
  currency: string;
  exchangeRate: string;
  taxRate: string;
  priceIncludesTax?: boolean;
  batchNo: string;
  location: SelectedStockLocation | null;
  storageLocation: string;
  remarks: string;
  customValues?: Record<string, unknown>;
}

interface PurchaseReturnItemEditorProps {
  item: PurchaseReturnDraftItem;
  index: number;
  warehouseId?: string | null;
  canManagePrice: boolean;
  requireUnitPrice: boolean;
  showRemove: boolean;
  materialError?: string;
  quantityError?: string;
  priceError?: string;
  currencyError?: string;
  exchangeRateError?: string;
  taxRateError?: string;
  taxModeError?: string;
  customFieldSchema: CustomFieldSchemaState;
  customFieldErrors?: Record<string, string>;
  fetchMaterials: EntityPickerFetchFn<Material>;
  onRemove: () => void;
  onUpdate: (patch: Partial<PurchaseReturnDraftItem>) => void;
}

export const PurchaseReturnItemEditor = React.memo(function PurchaseReturnItemEditor({
  item,
  index,
  warehouseId,
  canManagePrice,
  requireUnitPrice,
  showRemove,
  materialError,
  quantityError,
  priceError,
  currencyError,
  exchangeRateError,
  taxRateError,
  taxModeError,
  customFieldSchema,
  customFieldErrors,
  fetchMaterials,
  onRemove,
  onUpdate,
}: PurchaseReturnItemEditorProps) {
  const { colors } = useTheme();
  const { options: currencyOptions } = useDict('currency');
  const { labelMap: materialUnitLabelMap } = useDict('material_unit');
  const quantity = Number(item.returnQty);
  const validQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : undefined;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.index, { color: colors.textSecondary }]}>第 {index + 1} 行</Text>
        {showRemove ? (
          <TouchableOpacity onPress={onRemove} hitSlop={styles.hitSlop}>
            <Ionicons name="close-circle-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        ) : null}
      </View>
      <MaterialPickerField<Material>
        label="物料"
        required
        value={item.material}
        onChange={(material) => {
          onUpdate({
            material,
            batchNo: material?.id === item.material?.id ? item.batchNo : '',
            location: material?.id === item.material?.id ? item.location : null,
          });
        }}
        fetchFn={fetchMaterials}
        keyExtractor={(material) => material.id}
        labelExtractor={(material) => material.name}
        sublabelExtractor={(material) =>
          [material.code, material.spec, formatUnitLabel(material.unit, materialUnitLabelMap)]
            .filter(Boolean)
            .join(' · ')
        }
        placeholder="请选择物料"
        clearable
        error={materialError}
      />
      <View style={styles.row}>
        <View style={styles.flexField}>
          <FormField
            label={`退货数量${item.material?.unit ? `（${formatUnitLabel(item.material.unit, materialUnitLabelMap)}）` : ''}`}
            required
            value={item.returnQty}
            onChangeText={(returnQty) => onUpdate({ returnQty })}
            placeholder="0"
            keyboardType="decimal-pad"
            error={quantityError}
          />
        </View>
        {canManagePrice ? (
          <View style={styles.flexField}>
            <FormField
              label="单价（基础单位）"
              required={requireUnitPrice}
              value={item.unitPrice}
              onChangeText={(unitPrice) => onUpdate({ unitPrice })}
              placeholder={requireUnitPrice ? '必填' : '可选'}
              keyboardType="decimal-pad"
              error={priceError}
            />
          </View>
        ) : null}
      </View>
      {canManagePrice && requireUnitPrice ? (
        <>
          <PickerField
            label="币别"
            required
            value={item.currency}
            options={currencyOptions}
            onChange={(currency) => onUpdate({ currency })}
            placeholder="请选择币别"
            error={currencyError}
          />
          <View style={styles.row}>
            <View style={styles.flexField}>
              <FormField
                label="汇率"
                required
                value={item.exchangeRate}
                onChangeText={(exchangeRate) => onUpdate({ exchangeRate })}
                placeholder="例如 1"
                keyboardType="decimal-pad"
                error={exchangeRateError}
              />
            </View>
            <View style={styles.flexField}>
              <FormField
                label="税率（%）"
                required
                value={item.taxRate}
                onChangeText={(taxRate) => onUpdate({ taxRate })}
                placeholder="可填 0"
                keyboardType="decimal-pad"
                error={taxRateError}
              />
            </View>
          </View>
          <PickerField
            label="单价含税"
            required
            value={
              item.priceIncludesTax === undefined ? '' : item.priceIncludesTax ? 'true' : 'false'
            }
            options={[
              { label: '含税', value: 'true' },
              { label: '未税', value: 'false' },
            ]}
            onChange={(value) => onUpdate({ priceIncludesTax: value === 'true' })}
            placeholder="请选择含税口径"
            error={taxModeError}
          />
        </>
      ) : null}
      {item.material?.hasBatchTracking ? (
        <ExistingBatchPickerField
          materialId={item.material.id}
          warehouseId={warehouseId}
          value={item.batchNo}
          onChangeBatchNo={(batchNo) => onUpdate({ batchNo })}
          label="批号"
          required
          mode="outbound"
          placeholder="扫码或选择退货批号"
        />
      ) : (
        <FormField
          label="批号（选填）"
          value={item.batchNo}
          onChangeText={(batchNo) => onUpdate({ batchNo })}
          placeholder="可选"
        />
      )}
      <StockLocationField
        label="退库仓位"
        action="stock/out"
        warehouseId={warehouseId}
        value={item.location}
        onChange={(location) => onUpdate({ location })}
        storageLocation={item.storageLocation}
        onStorageLocationChange={(storageLocation) => onUpdate({ storageLocation })}
        showStorageLocationText
        materialId={item.material?.id}
        batchNo={item.batchNo}
        minAvailableQty={validQuantity}
      />
      <StockBalancePreview
        warehouseId={warehouseId}
        materialId={item.material?.id}
        locationId={item.location?.id}
        storageLocation={item.storageLocation}
        batchNo={item.batchNo}
        requiredQty={validQuantity}
      />
      <Text style={[styles.stockHint, { color: colors.textSecondary }]}>
        库存仅供预览，提交退库出库时将按实时库存再次校验。
      </Text>
      <FormField
        label="明细备注"
        value={item.remarks}
        onChangeText={(remarks) => onUpdate({ remarks })}
        placeholder="可选"
      />
      <CustomFieldFormSection
        fields={customFieldSchema.fields}
        values={item.customValues ?? {}}
        errors={customFieldErrors ?? {}}
        mode={item.id ? 'update' : 'create'}
        loading={customFieldSchema.loading}
        loadError={customFieldSchema.loadError}
        showSection={false}
        onChange={(fieldKey, value) =>
          onUpdate({ customValues: { ...(item.customValues ?? {}), [fieldKey]: value } })
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  index: { fontSize: FontSize.xs, fontWeight: '600' },
  row: { flexDirection: 'row', gap: Spacing.sm },
  flexField: { flex: 1 },
  stockHint: { fontSize: FontSize.xs, lineHeight: 18 },
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
});
