import { StyleSheet, View } from 'react-native';
import type { MaterialSupplierPriceTier } from '../../types/models/MaterialSupplierPriceTier';
import { Badge } from '../../../core/components/Badge.tsx';
import { Spacing } from '../../../core/theme/tokens';
import { useAmountDisplay } from '../../host/hooks/useAmountDisplay';
import { useDict } from '../../host/hooks/useDict';

const DEFAULT_PURCHASE_PRICE_CURRENCY = 'CNY';

// ─── Utils ───────────────────────────────────────────────────────────────────

function sortPriceTiers(a: MaterialSupplierPriceTier, b: MaterialSupplierPriceTier) {
  const gradeCompare = (a.grade ?? '').localeCompare(b.grade ?? '');
  if (gradeCompare !== 0) return gradeCompare;
  if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
  return (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MaterialSupplierPriceTierSummary({
  priceTiers,
  maxVisible = 3,
}: {
  priceTiers?: MaterialSupplierPriceTier[];
  maxVisible?: number;
}) {
  const { labelMap: materialGradeLabelMap } = useDict('material_grade');
  const { mask } = useAmountDisplay();
  const tiers = [...(priceTiers ?? [])].sort(sortPriceTiers);
  if (tiers.length === 0) return null;

  const visibleTiers = tiers.slice(0, maxVisible);

  return (
    <View style={styles.row}>
      {visibleTiers.map((tier) => {
        const gradeLabel = tier.grade
          ? (materialGradeLabelMap[tier.grade] ?? tier.grade)
          : '无等级';
        const priceLabel = mask(
          `${tier.currency ?? DEFAULT_PURCHASE_PRICE_CURRENCY} ${Number(tier.unitPrice).toFixed(4)}`,
        );
        return (
          <Badge
            key={tier.id}
            label={`${gradeLabel} ${priceLabel}`}
            variant={tier.isDefault ? 'primary' : 'default'}
            size="sm"
          />
        );
      })}
      {tiers.length > visibleTiers.length && (
        <Badge label={`+${tiers.length - visibleTiers.length}`} size="sm" />
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
});
