import { StyleSheet, View } from 'react-native';
import type { InternalIssueItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatQtyWithUnit } from '../../../utils/qty-unit';

interface InternalIssueItemsSectionProps {
  items?: InternalIssueItem[];
}

export function InternalIssueItemsSection({ items = [] }: InternalIssueItemsSectionProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');

  return (
    <DetailCard title={`领用明细（${items.length}）`} noPadding>
      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>暂无明细</Text>
        </View>
      ) : (
        items.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.itemRow,
              { backgroundColor: index % 2 === 0 ? colors.surface : colors.background },
              index > 0 && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
              },
            ]}
          >
            <View style={styles.itemHeader}>
              <Text style={[styles.itemCode, { color: colors.primary }]} numberOfLines={1}>
                {item.material?.code ?? '-'}
              </Text>
              <Text style={[styles.itemQty, { color: colors.text }]}>
                {formatQtyWithUnit(Number(item.qty), item.material?.unit, unitLabelMap)}
              </Text>
            </View>
            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
              {item.material?.name ?? '-'}
            </Text>
            <View style={styles.itemMeta}>
              <Text style={[styles.itemMetaText, { color: colors.textSecondary }]}>
                仓库: {item.warehouse?.name ?? '-'}
              </Text>
              {item.batchNo ? (
                <Text style={[styles.itemMetaText, { color: colors.textMuted }]}>
                  批号: {item.batchNo}
                </Text>
              ) : null}
            </View>
            {item.remarks ? (
              <Text style={[styles.itemRemark, { color: colors.textSecondary }]} numberOfLines={2}>
                备注: {item.remarks}
              </Text>
            ) : null}
          </View>
        ))
      )}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { padding: Spacing.md, alignItems: 'center' },
  emptyText: { fontSize: FontSize.sm },
  itemRow: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 2 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemCode: { fontSize: FontSize.xs, fontWeight: '600', flex: 1 },
  itemQty: { fontSize: FontSize.sm, fontWeight: '700', marginLeft: Spacing.sm },
  itemName: { fontSize: FontSize.sm, fontWeight: '500' },
  itemMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: 2 },
  itemMetaText: { fontSize: FontSize.xs },
  itemRemark: { fontSize: FontSize.xs, lineHeight: 18, marginTop: 2 },
});
