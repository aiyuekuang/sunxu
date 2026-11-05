import { StyleSheet, View } from 'react-native';
import type { CustomerMaterial } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface CustomerMaterialsSectionProps {
  materials: CustomerMaterial[];
}

export function CustomerMaterialsSection({ materials }: CustomerMaterialsSectionProps) {
  const { colors } = useTheme();

  return (
    <DetailCard title={`客户料号 (${materials.length})`} noPadding>
      {materials.length === 0 ? (
        <EmptyState compact icon="pricetag-outline" title="暂无客户料号" />
      ) : (
        <View style={styles.list}>
          {materials.map((item, idx) => {
            const title = item.customerMaterialName ?? item.material?.name ?? '-';
            const code = item.customerMaterialCode ?? item.material?.code ?? '-';
            const spec = item.customerMaterialSpec ?? '';

            return (
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
                    {title}
                  </Text>
                </View>
                <Text style={[styles.materialCode, { color: colors.textMuted }]}>{code}</Text>
                {spec ? (
                  <Text style={[styles.materialSpec, { color: colors.textSecondary }]}>
                    规格: {spec}
                  </Text>
                ) : null}
                <View style={styles.metaRow}>
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    内部物料: {item.material?.code ?? '-'} / {item.material?.name ?? '-'}
                  </Text>
                </View>
              </View>
            );
          })}
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
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  materialCode: { fontSize: FontSize.xs },
  materialSpec: { fontSize: FontSize.xs },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaText: { fontSize: FontSize.xs },
});
