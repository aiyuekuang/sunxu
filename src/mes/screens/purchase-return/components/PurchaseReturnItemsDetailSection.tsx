import { StyleSheet, View } from 'react-native';
import {
  getPurchaseReturnItemUnit,
  type PurchaseReturnItem,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { InlineCustomFieldValueRows } from '../../../components/custom-fields/InlineCustomFieldValueRows.tsx';
import { useCustomFieldSchema } from '../../../components/custom-fields/useCustomFieldSchema.ts';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber } from '../../../../core/utils/format';
import { formatQtyWithUnit } from '../../../utils/qty-unit';

interface PurchaseReturnItemsDetailSectionProps {
  items: PurchaseReturnItem[];
  priceVisible: boolean;
}

export function PurchaseReturnItemsDetailSection({
  items,
  priceVisible,
}: PurchaseReturnItemsDetailSectionProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const customFields = useCustomFieldSchema('purchase_return_item');
  return (
    <DetailCard title="退货明细" noPadding>
      {items.map((item, index) => {
        const unit = getPurchaseReturnItemUnit(item);
        return (
          <View key={item.id}>
            <View
              style={[
                styles.row,
                index < items.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.main}>
                <Text style={[styles.name, { color: colors.text }]}>
                  {item.material?.name ?? '未知物料'}
                </Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>
                  {item.material?.code ?? '-'}
                </Text>
                {item.batchNo ? (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    批号: {item.batchNo}
                  </Text>
                ) : null}
                {item.location?.pathName || item.storageLocationSnapshot ? (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    位置: {item.location?.pathName ?? item.storageLocationSnapshot}
                  </Text>
                ) : null}
                {item.remarks ? (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    备注: {item.remarks}
                  </Text>
                ) : null}
              </View>
              <View style={styles.quantity}>
                <Text style={[styles.quantityText, { color: colors.text }]}>
                  退 {formatQtyWithUnit(item.returnQty, unit, unitLabelMap)}
                </Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>
                  出 {formatQtyWithUnit(item.outboundQty, unit, unitLabelMap)}
                </Text>
                {priceVisible && item.unitPriceSnapshot != null ? (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    单价 {formatNumber(item.unitPriceSnapshot)}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.customValues}>
              <InlineCustomFieldValueRows
                fields={customFields.fields}
                values={item}
                loadError={index === 0 ? customFields.loadError : null}
              />
            </View>
          </View>
        );
      })}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  main: { flex: 1, gap: 3 },
  name: { fontSize: FontSize.base, fontWeight: '600' },
  meta: { fontSize: FontSize.xs },
  quantity: { alignItems: 'flex-end', gap: 3 },
  quantityText: { fontSize: FontSize.base, fontWeight: '700' },
  customValues: { paddingHorizontal: Spacing.md },
});
