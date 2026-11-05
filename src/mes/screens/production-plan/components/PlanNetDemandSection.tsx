import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { ProductionPlanNetDemandPreviewResponseDto } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatQtyWithUnit, type UnitLabelMap } from '../../../utils/qty-unit';

interface PlanNetDemandSectionProps {
  preview: ProductionPlanNetDemandPreviewResponseDto | null;
  loading: boolean;
  disabled: boolean;
  manualReasonRequired: boolean;
  stockNettingReason: string;
  onPreview: () => void;
  onUseSuggested: () => void;
  onUseFull: () => void;
  onStockNettingReasonChange: (reason: string) => void;
}

export function PlanNetDemandSection({
  preview,
  loading,
  disabled,
  manualReasonRequired,
  stockNettingReason,
  onPreview,
  onUseSuggested,
  onUseFull,
  onStockNettingReasonChange,
}: PlanNetDemandSectionProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>产出库存预览</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            计划阶段只计算净需求，不锁定库存；生成工单前仍按最新库存复核。
          </Text>
          {disabled ? (
            <Text style={[styles.hint, { color: colors.warning }]}>
              计划已锁定，库存预览与需求套用不可修改。
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={[
            styles.previewButton,
            {
              borderColor: colors.primary,
              backgroundColor: loading || disabled ? colors.surfaceSecondary : 'transparent',
              opacity: loading || disabled ? 0.8 : 1,
            },
            (loading || disabled) && styles.disabledButton,
          ]}
          onPress={onPreview}
          disabled={loading || disabled}
          accessibilityState={{ disabled: loading || disabled }}
          accessibilityHint={
            disabled ? '计划已锁定，不能重新预览' : loading ? '正在加载预览' : undefined
          }
          activeOpacity={0.8}
        >
          {loading ? (
            <InlineLoading size="small" />
          ) : (
            <Text
              style={[
                styles.previewButtonText,
                { color: disabled ? colors.textMuted : colors.primary },
              ]}
            >
              预览
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {preview && (
        <View style={[styles.previewBox, { backgroundColor: colors.background }]}>
          <View style={styles.metricRow}>
            <Metric
              label="毛需求"
              value={preview.grossDemandQty}
              unit={preview.unit}
              unitLabelMap={unitLabelMap}
            />
            <Metric
              label="可用库存"
              value={preview.currentStockQty}
              unit={preview.unit}
              unitLabelMap={unitLabelMap}
            />
            <Metric
              label="建议抵扣"
              value={preview.stockOffsetQty}
              unit={preview.unit}
              unitLabelMap={unitLabelMap}
            />
            <Metric
              label="建议生产"
              value={preview.suggestedProductionQty}
              unit={preview.unit}
              unitLabelMap={unitLabelMap}
            />
          </View>
          {preview.stockOffsetQty > 0 && (
            <View style={styles.actionRow}>
              {preview.suggestedProductionQty > 0 ? (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: disabled ? colors.surfaceSecondary : colors.primary,
                    },
                    disabled && styles.disabledButton,
                  ]}
                  onPress={onUseSuggested}
                  disabled={disabled}
                  accessibilityState={{ disabled }}
                  accessibilityHint={disabled ? '计划已锁定，不能套用建议净需求' : undefined}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.actionText,
                      { color: disabled ? colors.textMuted : colors.textOnPrimary },
                    ]}
                  >
                    按净需求
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.zeroDemandHint, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.warning, { color: colors.textSecondary }]}>
                    当前可用库存已覆盖需求，建议不新建生产计划。
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: disabled ? colors.border : 'transparent',
                  },
                  disabled && styles.disabledButton,
                ]}
                onPress={onUseFull}
                disabled={disabled}
                accessibilityState={{ disabled }}
                accessibilityHint={disabled ? '计划已锁定，不能套用生产全量' : undefined}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.actionText, { color: disabled ? colors.textMuted : colors.text }]}
                >
                  生产全量
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {preview.warnings.map((warning) => (
            <Text key={warning} style={[styles.warning, { color: colors.textSecondary }]}>
              {warning}
            </Text>
          ))}
        </View>
      )}

      {manualReasonRequired && (
        <FormField
          label="手工指定净需求原因"
          required
          value={stockNettingReason}
          onChangeText={onStockNettingReasonChange}
          placeholder="说明为什么不完全按系统建议净需求生产"
          multiline
          numberOfLines={2}
        />
      )}
    </View>
  );
}

function Metric({
  label,
  value,
  unit,
  unitLabelMap,
}: {
  label: string;
  value: number;
  unit: string;
  unitLabelMap: UnitLabelMap;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.text }]}>
        {formatQtyWithUnit(value, unit, unitLabelMap, {
          compact: false,
          maximumFractionDigits: 4,
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerText: { flex: 1, gap: 2 },
  title: { fontSize: FontSize.sm, fontWeight: '600' },
  hint: { fontSize: FontSize.xs, lineHeight: 18 },
  previewButton: {
    minWidth: 64,
    minHeight: 34,
    borderWidth: 1,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  previewButtonText: { fontSize: FontSize.sm, fontWeight: '600' },
  previewBox: {
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metric: {
    minWidth: 116,
    flex: 1,
    gap: 2,
  },
  metricLabel: { fontSize: FontSize.xs },
  metricValue: { fontSize: FontSize.sm, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  zeroDemandHint: {
    flex: 1,
    minHeight: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  actionText: { fontSize: FontSize.sm, fontWeight: '600' },
  warning: { fontSize: FontSize.xs, lineHeight: 18 },
  disabledButton: { borderWidth: 1 },
});
