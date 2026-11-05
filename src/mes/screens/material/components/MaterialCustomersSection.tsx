import { StyleSheet, View } from 'react-native';
import type { CustomerMaterial } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface MaterialCustomersSectionProps {
  customerMaterials: CustomerMaterial[];
}

export function MaterialCustomersSection({ customerMaterials }: MaterialCustomersSectionProps) {
  const { colors } = useTheme();

  return (
    <DetailCard title={`客户料号 (${customerMaterials.length})`} noPadding>
      {customerMaterials.length === 0 ? (
        <EmptyState compact icon="people-outline" title="暂无客户料号" />
      ) : (
        <View style={styles.list}>
          {customerMaterials.map((item, idx) => (
            <View
              key={item.id}
              style={[
                styles.customerItem,
                { borderBottomColor: colors.border },
                idx === customerMaterials.length - 1 && styles.lastItem,
              ]}
            >
              <View style={styles.customerHeader}>
                <Text style={[styles.customerName, { color: colors.text }]} numberOfLines={1}>
                  {item.customer?.name ?? '-'}
                </Text>
              </View>
              <Text style={[styles.customerCode, { color: colors.textMuted }]}>
                {item.customer?.customerCode ?? '-'}
              </Text>

              <View style={styles.metaRow}>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  客户料号: {item.customerMaterialCode ?? '-'} /{' '}
                  {item.customerMaterialName ?? item.material?.name ?? '-'}
                </Text>
              </View>

              {item.customerMaterialSpec && (
                <Text style={[styles.subText, { color: colors.textMuted }]}>
                  客户规格: {item.customerMaterialSpec}
                </Text>
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

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.base },
  customerItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
  },
  lastItem: { borderBottomWidth: 0 },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  customerName: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  customerCode: { fontSize: FontSize.xs },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaText: { fontSize: FontSize.xs },
  subText: { fontSize: FontSize.xs },
});
