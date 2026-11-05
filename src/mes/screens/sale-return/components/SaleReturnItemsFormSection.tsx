import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { Material } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import type { EntityPickerFetchFn } from '../../../../core/components/EntityPickerModal.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FormSection } from '../../../../core/components/FormPage.tsx';
import { CustomFieldFormSection } from '../../../components/custom-fields/CustomFieldFormSection.tsx';
import type { CustomFieldSchemaState } from '../../../components/custom-fields/useCustomFieldSchema.ts';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatUnitLabel } from '../../../utils/qty-unit';

export interface SaleReturnDraftItem {
  key: string;
  material: Material | null;
  returnQty: string;
  unitPrice: string;
  customValues?: Record<string, unknown>;
}

interface SaleReturnItemsFormSectionProps {
  items: SaleReturnDraftItem[];
  requiresCreditNotePrice: boolean;
  errors: Record<string, string>;
  customFieldSchema: CustomFieldSchemaState;
  customFieldErrors: Record<string, Record<string, string>>;
  fetchMaterials: EntityPickerFetchFn<Material>;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onUpdate: (key: string, patch: Partial<SaleReturnDraftItem>) => void;
}

export function SaleReturnItemsFormSection({
  items,
  requiresCreditNotePrice,
  errors,
  customFieldSchema,
  customFieldErrors,
  fetchMaterials,
  onAdd,
  onRemove,
  onUpdate,
}: SaleReturnItemsFormSectionProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useDict('material_unit');

  return (
    <FormSection title="退货明细">
      {errors.items ? (
        <Text style={[styles.error, { color: colors.error }]}>{errors.items}</Text>
      ) : null}
      {items.map((item, index) => (
        <View
          key={item.key}
          style={[
            styles.item,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
          ]}
        >
          <View style={styles.itemHeader}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>第 {index + 1} 行</Text>
            {items.length > 1 ? (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemove(item.key)}
                accessibilityRole="button"
                accessibilityLabel={`删除第 ${index + 1} 行`}
              >
                <Ionicons name="close-circle-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            ) : null}
          </View>
          <MaterialPickerField<Material>
            label="物料"
            required
            value={item.material}
            onChange={(material) => onUpdate(item.key, { material })}
            fetchFn={fetchMaterials}
            keyExtractor={(material) => material.id}
            labelExtractor={(material) => material.name}
            sublabelExtractor={(material) =>
              [material.code, material.spec].filter(Boolean).join(' · ')
            }
            placeholder="请选择物料"
            error={errors[`item.${item.key}.material`]}
          />
          <FormField
            label={`申请退货数量${item.material?.unit ? `（${formatUnitLabel(item.material.unit, unitLabelMap)}）` : ''}`}
            required
            value={item.returnQty}
            onChangeText={(returnQty) => onUpdate(item.key, { returnQty })}
            placeholder="请输入数量"
            keyboardType="decimal-pad"
            error={errors[`item.${item.key}.quantity`]}
          />
          {requiresCreditNotePrice ? (
            <FormField
              label="协商退货单价（含税）"
              required
              value={item.unitPrice}
              onChangeText={(unitPrice) => onUpdate(item.key, { unitPrice })}
              placeholder="按双方确认的单价填写"
              keyboardType="decimal-pad"
              error={errors[`item.${item.key}.price`]}
            />
          ) : null}
          <CustomFieldFormSection
            fields={customFieldSchema.fields}
            values={item.customValues ?? {}}
            errors={customFieldErrors[item.key] ?? {}}
            mode="create"
            loading={customFieldSchema.loading}
            loadError={customFieldSchema.loadError}
            showSection={false}
            onChange={(fieldKey, value) =>
              onUpdate(item.key, {
                customValues: { ...(item.customValues ?? {}), [fieldKey]: value },
              })
            }
          />
        </View>
      ))}
      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: colors.primarySurface, borderColor: colors.primary },
        ]}
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="添加退货物料"
      >
        <Text style={[styles.addText, { color: colors.primary }]}>+ 添加物料</Text>
      </TouchableOpacity>
    </FormSection>
  );
}

const styles = StyleSheet.create({
  item: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MIN_TOUCH_TARGET,
  },
  removeButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: { fontSize: FontSize.xs, fontWeight: '600' },
  error: { fontSize: FontSize.xs },
  addButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { fontSize: FontSize.sm, fontWeight: '600' },
});
