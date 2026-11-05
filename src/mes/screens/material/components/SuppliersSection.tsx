import { today } from '../../../../core/utils/date';
import { StyleSheet, View } from 'react-native';
import type { MaterialSupplierWithDefaultPrice } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { Badge } from '../../../../core/components/Badge.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { MaterialSupplierPriceTierSummary } from '../../../components/purchase/MaterialSupplierPriceTierSummary.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SuppliersSectionProps {
  suppliers: MaterialSupplierWithDefaultPrice[];
}

const DEFAULT_PURCHASE_PRICE_CURRENCY = 'CNY';

// ─── Component ────────────────────────────────────────────────────────────────

export function SuppliersSection({ suppliers }: SuppliersSectionProps) {
  const { colors } = useTheme();
  const { permitted: canViewPrices, mask } = useAmountDisplay();

  return (
    <DetailCard title={`供应商 (${suppliers.length})`} noPadding>
      {suppliers.length === 0 ? (
        <EmptyState compact icon="business-outline" title="暂无供应商" />
      ) : (
        <View style={styles.list}>
          {suppliers.map((item, idx) => (
            <View
              key={item.id}
              style={[
                styles.supplierItem,
                { borderBottomColor: colors.border },
                idx === suppliers.length - 1 && styles.lastItem,
              ]}
            >
              <View style={styles.supplierHeader}>
                <Text style={[styles.supplierName, { color: colors.text }]}>
                  {item.supplier?.name ?? '-'}
                </Text>
                {item.isDefault && <Badge label="默认" variant="primary" size="sm" />}
              </View>
              <View style={styles.metaRow}>
                {canViewPrices && item.defaultPurchasePrice != null && (
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    默认价:{' '}
                    {mask(
                      `${
                        item.defaultPurchaseCurrency ?? DEFAULT_PURCHASE_PRICE_CURRENCY
                      } ${Number(item.defaultPurchasePrice).toFixed(4)}`,
                    )}
                  </Text>
                )}
                {item.leadTimeDays != null && (
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    交期: {item.leadTimeDays}天
                  </Text>
                )}
                {item.minOrderQty != null && (
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    起订: {item.minOrderQty}
                  </Text>
                )}
                {item.validFrom && (
                  <Text
                    style={[
                      styles.metaText,
                      {
                        color: item.validFrom > today() ? colors.warning : colors.textSecondary,
                      },
                    ]}
                  >
                    {item.validFrom > today()
                      ? `${item.validFrom} 待生效`
                      : `生效: ${item.validFrom}`}
                  </Text>
                )}
              </View>
              {item.supplierMaterialCode && (
                <Text style={[styles.subText, { color: colors.textMuted }]}>
                  供应商料号: {item.supplierMaterialCode}
                </Text>
              )}
              {item.activePriceTiers && item.activePriceTiers.length > 0 && (
                <MaterialSupplierPriceTierSummary priceTiers={item.activePriceTiers} />
              )}
              {item.remarks && (
                <Text style={[styles.subText, { color: colors.textMuted }]}>{item.remarks}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.base },
  supplierItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  supplierName: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaText: {
    fontSize: FontSize.xs,
  },
  subText: {
    fontSize: FontSize.xs,
  },
});
