import { StyleSheet, View } from 'react-native';
import { getSaleReturnItemUnit, type SaleReturnItem } from '../../../host/services';
import { AmountPolicySnapshotInfo } from '../../../components/common/AmountPolicySnapshotInfo.tsx';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { InlineCustomFieldValueRows } from '../../../components/custom-fields/InlineCustomFieldValueRows.tsx';
import { useCustomFieldSchema } from '../../../components/custom-fields/useCustomFieldSchema.ts';
import { SALE_RETURN_DISPOSITION_CONFIG } from '../../../constants/status-configs';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatAmount } from '../../../../core/utils/format';
import { formatQtyWithUnit, type UnitLabelMap } from '../../../utils/qty-unit';

interface SaleReturnItemsSectionProps {
  items: SaleReturnItem[];
  mask?: (amount: string) => string;
  priceVisible: boolean;
}

function formatQty(
  value: number | null | undefined,
  unit: string | null,
  unitLabelMap: UnitLabelMap,
): string {
  if (value == null) return '-';
  return formatQtyWithUnit(value, unit, unitLabelMap);
}

function getItemName(item: SaleReturnItem): string {
  return item.material?.name ?? item.sourceDeliveryItem?.material?.name ?? '未知物料';
}

function getItemCode(item: SaleReturnItem): string {
  return item.material?.code ?? item.sourceDeliveryItem?.material?.code ?? '-';
}

export function SaleReturnItemsSection({ items, mask, priceVisible }: SaleReturnItemsSectionProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const customFields = useCustomFieldSchema('sale_return_item');

  return (
    <DetailCard title="退货明细" noPadding>
      <View style={styles.itemsContainer}>
        {items.map((item, idx) => {
          const unit = getSaleReturnItemUnit(item);
          return (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                idx < items.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.itemContent}>
                <View style={styles.itemMain}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{getItemName(item)}</Text>
                  <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                    {getItemCode(item)}
                  </Text>
                  {item.batchNo ? (
                    <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                      批号: {item.batchNo}
                    </Text>
                  ) : null}
                  {item.storageLocationSnapshot ? (
                    <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                      位置: {item.storageLocationSnapshot}
                    </Text>
                  ) : null}
                  <View style={styles.badgeRow}>
                    <ConfigBadge value={item.disposition} config={SALE_RETURN_DISPOSITION_CONFIG} />
                  </View>
                  {item.remarks ? (
                    <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                      备注: {item.remarks}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.itemRight}>
                  <Text style={[styles.itemQty, { color: colors.text }]}>
                    退 {formatQty(item.returnQty, unit, unitLabelMap)}
                  </Text>
                  <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                    收 {formatQty(item.receivedQty, unit, unitLabelMap)}
                  </Text>
                  {priceVisible ? (
                    <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                      {item.amountSnapshot == null
                        ? '金额 -'
                        : `金额 ${
                            mask
                              ? mask(formatAmount(item.amountSnapshot))
                              : formatAmount(item.amountSnapshot)
                          }`}
                    </Text>
                  ) : null}
                </View>
              </View>
              {priceVisible ? (
                <AmountPolicySnapshotInfo
                  priceSnapshot={item.sourceSnapshot}
                  mask={mask}
                  style={styles.amountPolicy}
                />
              ) : null}
              <InlineCustomFieldValueRows
                fields={customFields.fields}
                values={item}
                loadError={idx === 0 ? customFields.loadError : null}
              />
            </View>
          );
        })}
      </View>
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  itemsContainer: { padding: 0 },
  itemRow: { padding: Spacing.md },
  itemContent: { flexDirection: 'row', justifyContent: 'space-between' },
  itemMain: { flex: 1, gap: 3 },
  itemName: { fontSize: FontSize.base, fontWeight: '600' },
  itemMeta: { fontSize: FontSize.xs },
  itemRight: { alignItems: 'flex-end', gap: 3, marginLeft: Spacing.sm },
  itemQty: { fontSize: FontSize.base, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: 2 },
  amountPolicy: { alignSelf: 'stretch', marginTop: Spacing.xs },
});
