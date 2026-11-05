import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { CustomerExternalItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import {
  CUSTOMER_INBOUND_STATUS_CONFIG,
  CUSTOMER_INBOUND_USAGE_TYPE_CONFIG,
} from '../../../constants/status-configs';
import { FontSize } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime } from '../../../../core/utils/date';
import { formatQtyWithUnit } from '../../../utils/qty-unit';

interface CustomerInboundCardProps {
  item: CustomerExternalItem;
  onPress: () => void;
}

export const CustomerInboundCard = React.memo(function CustomerInboundCard({
  item,
  onPress,
}: CustomerInboundCardProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');

  return (
    <ListCard onPress={onPress}>
      <ListCard.Header>
        <Text style={[styles.customer, { color: colors.text }]} numberOfLines={1}>
          {item.registerNo}
        </Text>
        <ConfigBadge value={item.status} config={CUSTOMER_INBOUND_STATUS_CONFIG} size="sm" />
      </ListCard.Header>
      <ListCard.Title>{item.itemName}</ListCard.Title>
      <ListCard.Subtitle>
        {[item.customer?.name, item.itemSpec, item.itemType].filter(Boolean).join(' / ') ||
          '无规格'}
      </ListCard.Subtitle>
      <ListCard.Meta>
        <ListCard.MetaText>
          {formatQtyWithUnit(item.qty, item.unit, unitLabelMap)}
        </ListCard.MetaText>
        <ConfigBadge value={item.usageType} config={CUSTOMER_INBOUND_USAGE_TYPE_CONFIG} size="sm" />
      </ListCard.Meta>
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]} numberOfLines={1}>
          保管：
          {[item.custodyWarehouse?.name, item.storageLocation].filter(Boolean).join(' / ') || '-'}
        </Text>
        <Text style={[styles.footerText, { color: colors.textMuted }]} numberOfLines={1}>
          {formatDateTime(item.receivedAt)}
        </Text>
      </View>
    </ListCard>
  );
});

const styles = StyleSheet.create({
  customer: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  footerText: { fontSize: FontSize.xs, flexShrink: 1 },
});
