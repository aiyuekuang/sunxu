import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Material } from '../../../host/services';
import { materialService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import type { DraftItem } from '../../../types/draft-item';
import { formatUnitLabel } from '../../../utils/qty-unit';

interface PrFormItemRowProps {
  item: DraftItem;
  index: number;
  canDelete: boolean;
  quantityError?: string;
  dateError?: string;
  onChange: (index: number, item: DraftItem) => void;
  onDelete: (index: number) => void;
}

export const PrFormItemRow = React.memo(function PrFormItemRow({
  item,
  index,
  canDelete,
  quantityError,
  dateError,
  onChange,
  onDelete,
}: PrFormItemRowProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');

  const update = (patch: Partial<DraftItem>) => {
    onChange(index, { ...item, ...patch });
  };

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.textSecondary }]}>
          物料行 #{index + 1}
        </Text>
        {canDelete && (
          <Pressable onPress={() => onDelete(index)} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={colors.error} />
          </Pressable>
        )}
      </View>

      <MaterialPickerField<Material>
        label="物料"
        required
        value={item.material}
        onChange={(material) => update({ material })}
        fetchFn={(p) => materialService.list({ ...p, isActive: true })}
        keyExtractor={(material) => material.id}
        labelExtractor={(material) => material.name}
        sublabelExtractor={(material) => material.spec || '未维护规格'}
        title="选择物料"
      />

      {item.material ? (
        <View style={[styles.materialMeta, { borderColor: colors.border }]}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            物料代码：{item.material.code || '-'}
          </Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            物料名称：{item.material.name || '-'}
          </Text>
          <Text
            style={[
              styles.metaText,
              {
                color: item.material.spec ? colors.textSecondary : colors.warning,
              },
            ]}
          >
            物料规格：{item.material.spec || '未维护规格'}
          </Text>
        </View>
      ) : null}

      <QuickNumInput
        label="需求数量"
        required
        error={quantityError}
        value={item.quantity}
        onChangeText={(quantity) => update({ quantity })}
        unit={formatUnitLabel(item.material?.unit, unitLabelMap) || undefined}
        min={0.001}
        precision={4}
      />

      <DatePickerField
        label="到货日期"
        required
        value={item.expectedArrivalDate}
        onChange={(expectedArrivalDate) => update({ expectedArrivalDate })}
        placeholder="请选择到货日期"
        error={dateError}
      />

      <FormField
        label="行备注"
        value={item.remarks}
        onChangeText={(remarks) => update({ remarks })}
        placeholder="选填，如急补原因、规格要求、替代说明"
        multiline
        numberOfLines={2}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  materialMeta: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 2,
  },
  metaText: {
    fontSize: FontSize.xs,
  },
});
