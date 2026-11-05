import { StyleSheet, View } from 'react-native';
import type { QualityInspectionItem } from '../../../types/models/QualityInspectionItem';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InspectionItemsDetailSectionProps {
  items: QualityInspectionItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InspectionItemsDetailSection({ items }: InspectionItemsDetailSectionProps) {
  const { colors } = useTheme();

  if (!items || items.length === 0) return null;

  return (
    <DetailCard title={`检验项明细（${items.length} 项）`}>
      {items.map((item, idx) => (
        <View
          key={item.id}
          style={[
            styles.itemRow,
            idx > 0 && { borderTopWidth: 0.5, borderTopColor: colors.border },
          ]}
        >
          <View style={styles.itemMain}>
            <Text style={[styles.itemName, { color: colors.text }]}>
              {item.itemName}
              {item.isRequired ? ' *' : ''}
            </Text>
            {item.standard && (
              <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>
                规格: {item.standard}
                {item.unit ? ` (${item.unit})` : ''}
              </Text>
            )}
            {(item.upperLimit != null || item.lowerLimit != null) && (
              <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>
                范围: {item.lowerLimit ?? '-'} ~ {item.upperLimit ?? '-'}
                {item.unit ? ` ${item.unit}` : ''}
              </Text>
            )}
          </View>
          <Text style={[styles.definitionText, { color: colors.textMuted }]}>标准定义</Text>
        </View>
      ))}
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    gap: 6,
  },
  itemMain: { flex: 1, gap: 2 },
  itemName: { fontSize: FontSize.sm, fontWeight: '500' },
  itemDetail: { fontSize: FontSize.xs },
  definitionText: { fontSize: FontSize.xs },
});
