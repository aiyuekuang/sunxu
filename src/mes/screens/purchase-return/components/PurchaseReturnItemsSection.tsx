import { StyleSheet, TouchableOpacity } from 'react-native';
import type { Material } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import type { EntityPickerFetchFn } from '../../../../core/components/EntityPickerModal.tsx';
import { FormSection } from '../../../../core/components/FormPage.tsx';
import type { CustomFieldSchemaState } from '../../../components/custom-fields/useCustomFieldSchema.ts';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { type PurchaseReturnDraftItem, PurchaseReturnItemEditor } from './PurchaseReturnItemEditor.tsx';

interface PurchaseReturnItemsSectionProps {
  items: PurchaseReturnDraftItem[];
  warehouseId?: string | null;
  canManagePrice: boolean;
  requireUnitPrice: boolean;
  errors: Record<string, string>;
  customFieldSchema: CustomFieldSchemaState;
  customFieldErrors: Record<string, Record<string, string>>;
  fetchMaterials: EntityPickerFetchFn<Material>;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onUpdate: (key: string, patch: Partial<PurchaseReturnDraftItem>) => void;
}

export function PurchaseReturnItemsSection({
  items,
  warehouseId,
  canManagePrice,
  requireUnitPrice,
  errors,
  customFieldSchema,
  customFieldErrors,
  fetchMaterials,
  onAdd,
  onRemove,
  onUpdate,
}: PurchaseReturnItemsSectionProps) {
  const { colors } = useTheme();
  return (
    <FormSection title="退货明细">
      {items.map((item, index) => (
        <PurchaseReturnItemEditor
          key={item.key}
          item={item}
          index={index}
          warehouseId={warehouseId}
          canManagePrice={canManagePrice}
          requireUnitPrice={requireUnitPrice}
          showRemove={items.length > 1}
          materialError={errors[`item.${item.key}.material`]}
          quantityError={errors[`item.${item.key}.quantity`]}
          priceError={errors[`item.${item.key}.price`]}
          currencyError={errors[`item.${item.key}.currency`]}
          exchangeRateError={errors[`item.${item.key}.exchangeRate`]}
          taxRateError={errors[`item.${item.key}.taxRate`]}
          taxModeError={errors[`item.${item.key}.priceIncludesTax`]}
          customFieldSchema={customFieldSchema}
          customFieldErrors={customFieldErrors[item.key]}
          fetchMaterials={fetchMaterials}
          onRemove={() => onRemove(item.key)}
          onUpdate={(patch) => onUpdate(item.key, patch)}
        />
      ))}
      <TouchableOpacity
        style={[
          styles.addButton,
          { borderColor: colors.primary, backgroundColor: colors.primarySurface },
        ]}
        onPress={onAdd}
      >
        <Text style={[styles.addText, { color: colors.primary }]}>+ 添加物料</Text>
      </TouchableOpacity>
    </FormSection>
  );
}

const styles = StyleSheet.create({
  addButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  addText: { fontSize: FontSize.sm, fontWeight: '600' },
});
