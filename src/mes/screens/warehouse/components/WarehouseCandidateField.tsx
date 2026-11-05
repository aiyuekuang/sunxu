import { StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import type { Warehouse } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { Badge } from '../../../../core/components/Badge.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatCompactNumber, formatNumber } from '../../../../core/utils/format';

const CHIP_MODE_LIMIT = 5;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WarehouseCandidateOption {
  warehouse: Warehouse;
  availableQty: number;
  canFulfillQty: boolean;
}

interface WarehouseCandidateFieldProps {
  label: string;
  value: string;
  onChange: (warehouseId: string) => void;
  candidates: WarehouseCandidateOption[];
  required?: boolean;
  loading?: boolean;
  disabled?: boolean;
  unit?: string;
  emptyText?: string;
  helperText?: string;
  error?: string;
  style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WarehouseCandidateField({
  label,
  value,
  onChange,
  candidates,
  required = false,
  loading = false,
  disabled = false,
  unit,
  emptyText = '暂无可选仓库',
  helperText,
  error,
  style,
}: WarehouseCandidateFieldProps) {
  const { colors } = useTheme();
  const selected = candidates.find((item) => item.warehouse.id === value) ?? null;
  const useListMode = candidates.length > CHIP_MODE_LIMIT;

  const renderInventoryBadge = (item: WarehouseCandidateOption, isSelected: boolean) => {
    const tone = item.canFulfillQty ? colors.success : colors.warning;
    return (
      <Badge
        label={formatCompactNumber(item.availableQty)}
        size="sm"
        color={isSelected ? colors.textOnPrimary : tone}
        bg={isSelected ? `${colors.textOnPrimary}1F` : `${tone}18`}
      />
    );
  };

  const renderAvailabilityText = (item: WarehouseCandidateOption) => {
    const suffix = unit ? ` ${unit}` : '';
    const availableText = `可用 ${formatNumber(item.availableQty)}${suffix}`;
    if (item.canFulfillQty) return availableText;
    return `${availableText} · 库存不足`;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
          {required && <Text style={{ color: colors.error, fontSize: FontSize.sm }}> *</Text>}
        </Text>
        {helperText ? (
          <Text style={[styles.helperText, { color: colors.textMuted }]}>{helperText}</Text>
        ) : null}
      </View>

      {loading ? (
        <View
          style={[
            styles.placeholderBox,
            { borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <InlineLoading size="small" />
          <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
            正在加载仓库库存...
          </Text>
        </View>
      ) : disabled || candidates.length === 0 ? (
        <View
          style={[
            styles.placeholderBox,
            { borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <Text style={[styles.placeholderText, { color: colors.textMuted }]}>{emptyText}</Text>
        </View>
      ) : useListMode ? (
        <View style={[styles.listBox, { borderColor: colors.border }]}>
          {candidates.map((item, index) => {
            const isSelected = item.warehouse.id === value;
            return (
              <TouchableOpacity
                key={item.warehouse.id}
                activeOpacity={0.7}
                onPress={() => onChange(item.warehouse.id)}
                style={[
                  styles.listItem,
                  {
                    backgroundColor: isSelected ? colors.primarySurface : colors.surface,
                    borderBottomColor:
                      index === candidates.length - 1 ? 'transparent' : colors.borderLight,
                  },
                ]}
              >
                <View style={styles.listItemHeader}>
                  <Text
                    style={[
                      styles.listItemTitle,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {item.warehouse.name}
                  </Text>
                  {renderInventoryBadge(item, isSelected)}
                </View>
                <Text
                  style={[
                    styles.listItemSubtitle,
                    { color: item.canFulfillQty ? colors.textMuted : colors.warning },
                  ]}
                >
                  {renderAvailabilityText(item)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.chipRow}>
          {candidates.map((item) => {
            const isSelected = item.warehouse.id === value;
            return (
              <TouchableOpacity
                key={item.warehouse.id}
                activeOpacity={0.7}
                onPress={() => onChange(item.warehouse.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                    borderColor: isSelected
                      ? colors.primary
                      : item.canFulfillQty
                        ? colors.border
                        : colors.warning,
                  },
                ]}
              >
                <View style={styles.chipContent}>
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? colors.textOnPrimary : colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {item.warehouse.name}
                  </Text>
                  {renderInventoryBadge(item, isSelected)}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selected && !selected.canFulfillQty ? (
        <Text style={[styles.warningText, { color: colors.warning }]}>
          {renderAvailabilityText(selected)}
        </Text>
      ) : null}
      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  helperText: {
    flex: 1,
    fontSize: FontSize.xs,
    textAlign: 'right',
  },
  placeholderBox: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  placeholderText: {
    flex: 1,
    fontSize: FontSize.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxWidth: '100%',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    maxWidth: 120,
  },
  listBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  listItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  listItemTitle: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  listItemSubtitle: {
    fontSize: FontSize.xs,
  },
  warningText: {
    fontSize: FontSize.xs,
  },
  errorText: {
    fontSize: FontSize.xs,
  },
});
