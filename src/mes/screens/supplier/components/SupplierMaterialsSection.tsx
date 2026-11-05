import { today } from '../../../../core/utils/date';
import { StyleSheet, View } from 'react-native';
import type { MaterialSupplierWithDefaultPrice } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { MaterialSupplierPriceTierSummary } from '../../../components/purchase/MaterialSupplierPriceTierSummary.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useTheme } from '../../../../core/theme/useTheme';

interface SupplierMaterialsSectionProps {
  materials: MaterialSupplierWithDefaultPrice[];
}

const DEFAULT_PURCHASE_PRICE_CURRENCY = 'CNY';

export function SupplierMaterialsSection({ materials }: SupplierMaterialsSectionProps) {
  const { colors } = useTheme();
  const { permitted: canViewPrices, mask } = useAmountDisplay();

  return (
    <DetailCard title={`供应物料 (${materials.length})`} noPadding>
      {materials.length === 0 ? (
        <EmptyState compact icon="cube-outline" title="暂无供应物料" />
      ) : (
        <View style={styles.list}>
          {materials.map((item, idx) => (
            <View
              key={item.id}
              style={[
                styles.materialItem,
                { borderBottomColor: colors.border },
                idx === materials.length - 1 && styles.lastItem,
              ]}
            >
              <View style={styles.materialHeader}>
                <Text style={[styles.materialName, { color: colors.text }]} numberOfLines={1}>
                  {item.material?.name ?? '-'}
                </Text>
                {item.isDefault && (
                  <View style={[styles.defaultBadge, { backgroundColor: `${colors.primary}15` }]}>
                    <Text style={[styles.defaultBadgeText, { color: colors.primary }]}>默认</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.materialCode, { color: colors.textMuted }]}>
                {item.material?.code ?? '-'}
              </Text>
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
              {item.activePriceTiers && item.activePriceTiers.length > 0 && (
                <MaterialSupplierPriceTierSummary priceTiers={item.activePriceTiers} />
              )}
            </View>
          ))}
        </View>
      )}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.base },
  materialItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
  },
  lastItem: { borderBottomWidth: 0 },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  materialName: {
    fontSize: FontSize.base,
    fontWeight: '600',
    flex: 1,
  },
  materialCode: { fontSize: FontSize.xs },
  defaultBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaText: { fontSize: FontSize.xs },
});
