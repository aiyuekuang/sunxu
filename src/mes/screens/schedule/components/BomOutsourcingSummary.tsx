import { StyleSheet, View } from 'react-native';
import type { PlanScheduleBomOutsourcingDto } from '../../../types/models/PlanScheduleBomOutsourcingDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatQtyWithUnit } from '../../../utils/qty-unit';

interface BomOutsourcingSummaryProps {
  items: PlanScheduleBomOutsourcingDto[];
  mode?: 'preview' | 'result';
}

export function BomOutsourcingSummary({ items, mode = 'preview' }: BomOutsourcingSummaryProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  if (items.length === 0) return null;

  return (
    <DetailCard title="BOM 委外件供料摘要">
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {mode === 'preview'
          ? '按工单 BOM 和当前可用库存测算委外缺口；测算不会预留库存，正式排产时会按当时可用库存重新计算。'
          : '以下是本次排产后的委外结果。库存抵扣仅为测算记录，不代表库存已预留。'}
      </Text>
      {items.map((item, index) => (
        <View
          key={`${item.workOrderId}:${item.materialId}`}
          style={[
            styles.row,
            index < items.length - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.material, { color: colors.text }]}>
            {[item.materialCode, item.materialName].filter(Boolean).join(' ') || item.materialId}
          </Text>
          {item.materialSpec ? (
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              {item.materialSpec}
            </Text>
          ) : null}
          <Text style={[styles.detail, { color: colors.textSecondary }]}>
            {item.planNo ?? '未关联计划'} · {item.workOrderNo}
          </Text>
          <Text style={[styles.detail, { color: colors.textSecondary }]}>
            BOM需求 {formatQtyWithUnit(item.grossQty ?? 0, item.unit, unitLabelMap)}
            {' · '}库存抵扣 {formatQtyWithUnit(item.stockOffsetQty ?? 0, item.unit, unitLabelMap)}
          </Text>
          <Text style={[styles.quantity, { color: colors.primary }]}>
            需委外 {formatQtyWithUnit(item.outsourceQty, item.unit, unitLabelMap)}
          </Text>
          {mode === 'result' && (
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              委外单：
              {item.orderNo ?? (item.outsourceQty > 0 ? '未生成委外单' : '无需委外')}
            </Text>
          )}
        </View>
      ))}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: FontSize.xs, marginBottom: Spacing.sm },
  row: { paddingVertical: Spacing.sm, gap: 2 },
  material: { fontSize: FontSize.sm, fontWeight: '600' },
  detail: { fontSize: FontSize.xs },
  quantity: { fontSize: FontSize.xs, fontWeight: '600' },
});
