import { StyleSheet, View } from 'react-native';
import type { ProcessRouteApplicability } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard, InfoRow } from '../../../../core/components/DetailCard.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime } from '../../../../core/utils/date';

interface ProcessRouteApplicabilitySectionProps {
  items: ProcessRouteApplicability[];
}

function formatScope(value: string | null | undefined, fallback: string): string {
  return value?.trim() ? value : fallback;
}

export function ProcessRouteApplicabilitySection({ items }: ProcessRouteApplicabilitySectionProps) {
  const { colors } = useTheme();

  return (
    <DetailCard title="适用规则">
      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>暂无适用规则</Text>
      ) : (
        items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <View
              key={item.id}
              style={[
                styles.ruleBlock,
                !isLast && {
                  borderBottomColor: colors.border,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                },
              ]}
            >
              <View style={styles.ruleHeader}>
                <Text style={[styles.ruleTitle, { color: colors.text }]}>
                  {item.isDefault ? '默认规则' : `规则 ${index + 1}`}
                </Text>
                <Text style={[styles.priorityText, { color: colors.textSecondary }]}>
                  优先级 {item.priority}
                </Text>
              </View>
              <InfoRow label="适用物料" value={formatScope(item.material?.name, '不限物料')} />
              <InfoRow label="适用客户" value={formatScope(item.customer?.name, '不限客户')} />
              <InfoRow label="订单类型" value={formatScope(item.orderType, '不限订单类型')} />
              <InfoRow
                label="生效时间"
                value={item.effectiveFrom ? formatDateTime(item.effectiveFrom) : '立即生效'}
              />
              <InfoRow
                label="失效时间"
                value={item.effectiveTo ? formatDateTime(item.effectiveTo) : '长期有效'}
                last
              />
            </View>
          );
        })
      )}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontSize: FontSize.base,
    lineHeight: 20,
  },
  ruleBlock: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  ruleTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  priorityText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
