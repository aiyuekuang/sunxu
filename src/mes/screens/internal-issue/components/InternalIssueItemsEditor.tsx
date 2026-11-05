import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { Material } from '../../../host/services';
import { materialService } from '../../../host/services';
import type { Warehouse } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ExistingBatchPickerField } from '../../../components/common/ExistingBatchPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { WarehousePickerField } from '../../../components/common/WarehousePickerField.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatUnitLabel } from '../../../utils/qty-unit';

export interface InternalIssueDraftItem {
  rowKey: string;
  material: Material | null;
  warehouse: Warehouse | null;
  qty: string;
  batchNo: string;
  remarks: string;
}

export type InternalIssueItemField = 'material' | 'warehouse' | 'qty';
export type InternalIssueItemErrors = Partial<Record<InternalIssueItemField, string>>;

interface InternalIssueItemsEditorProps {
  items: InternalIssueDraftItem[];
  errors: Record<string, InternalIssueItemErrors>;
  onChange: (index: number, item: InternalIssueDraftItem) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
}

const fetchMaterials = (params: {
  page: number;
  pageSize: number;
  keyword?: string;
  categoryId?: string;
}) => materialService.list(params);

let internalIssueItemSequence = 0;

export function createEmptyInternalIssueItem(index: number): InternalIssueDraftItem {
  internalIssueItemSequence += 1;
  return {
    rowKey: `internal-issue-item-${index}-${internalIssueItemSequence}`,
    material: null,
    warehouse: null,
    qty: '',
    batchNo: '',
    remarks: '',
  };
}

export function InternalIssueItemsEditor({
  items,
  errors,
  onChange,
  onAdd,
  onDelete,
}: InternalIssueItemsEditorProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const rowErrors = errors[item.rowKey] ?? {};
        return (
          <View
            key={item.rowKey}
            style={[
              styles.itemCard,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight },
            ]}
          >
            <View style={styles.itemHeader}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>明细 {index + 1}</Text>
              {items.length > 1 ? (
                <TouchableOpacity
                  onPress={() => onDelete(index)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              ) : null}
            </View>
            <MaterialPickerField<Material>
              label="物料"
              required
              value={item.material}
              onChange={(material) => onChange(index, { ...item, material })}
              fetchFn={fetchMaterials}
              keyExtractor={(record) => record.id}
              labelExtractor={(record) => record.name}
              sublabelExtractor={(record) =>
                [record.spec, formatUnitLabel(record.unit, unitLabelMap)]
                  .filter(Boolean)
                  .join(' / ')
              }
              error={rowErrors.material}
            />
            <WarehousePickerField
              label="出库仓库"
              required
              value={item.warehouse}
              onChange={(warehouse) => onChange(index, { ...item, warehouse })}
              error={rowErrors.warehouse}
            />
            <FormField
              label="数量"
              required
              value={item.qty}
              onChangeText={(qty) => onChange(index, { ...item, qty })}
              keyboardType="decimal-pad"
              error={rowErrors.qty}
            />
            {item.material?.hasBatchTracking ? (
              <ExistingBatchPickerField
                materialId={item.material.id}
                warehouseId={item.warehouse?.id}
                value={item.batchNo}
                onChangeBatchNo={(batchNo) => onChange(index, { ...item, batchNo })}
                label="批号"
                required
                mode="outbound"
                placeholder="扫码或选择出库批号"
              />
            ) : (
              <FormField
                label="批号（选填）"
                value={item.batchNo}
                onChangeText={(batchNo) => onChange(index, { ...item, batchNo })}
                placeholder="可选"
              />
            )}
            <FormField
              label="行备注"
              value={item.remarks}
              onChangeText={(remarks) => onChange(index, { ...item, remarks })}
              multiline
              numberOfLines={2}
            />
          </View>
        );
      })}
      <TouchableOpacity
        onPress={onAdd}
        style={[styles.addButton, { borderColor: colors.primary }]}
        activeOpacity={0.72}
      >
        <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
        <Text style={[styles.addButtonText, { color: colors.primary }]}>添加明细</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  itemCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: { fontSize: FontSize.sm, fontWeight: '700' },
  addButton: {
    minHeight: 42,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  addButtonText: { fontSize: FontSize.sm, fontWeight: '700' },
});
