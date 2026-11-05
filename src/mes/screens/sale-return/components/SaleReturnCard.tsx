import React from 'react';
import { StyleSheet } from 'react-native';
import type { SaleReturn } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { SALE_RETURN_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime } from '../../../../core/utils/date';
import { formatNumber } from '../../../../core/utils/format';

interface SaleReturnCardProps {
  item: SaleReturn;
  onPress: () => void;
}

export const SaleReturnCard = React.memo(function SaleReturnCard({
  item,
  onPress,
}: SaleReturnCardProps) {
  const { colors } = useTheme();
  const { labelMap: reasonLabelMap } = useDict('sale_return_reason');
  const customerName = item.partnerNameSnapshot ?? item.customerName ?? item.customer?.name;
  const sourceDeliveryNo = item.sourceDeliveryNo ?? item.sourceDelivery?.deliveryNo;

  return (
    <ListCard onPress={onPress}>
      <ListCard.Header>
        <Text style={[styles.returnNo, { color: colors.text }]} numberOfLines={1}>
          {item.returnNo}
        </Text>
        <ConfigBadge value={item.status} config={SALE_RETURN_STATUS_CONFIG} size="sm" />
      </ListCard.Header>
      <ListCard.Title>{customerName || '未填写客户'}</ListCard.Title>
      <ListCard.Meta>
        <ListCard.MetaText>
          {sourceDeliveryNo ? `来源出库单：${sourceDeliveryNo}` : '来源：客户实物退回'}
        </ListCard.MetaText>
        {item.receiveWarehouseName ? (
          <ListCard.MetaText>退回仓库：{item.receiveWarehouseName}</ListCard.MetaText>
        ) : null}
        <ListCard.MetaText>申请退货：{formatNumber(item.totalReturnQty)}</ListCard.MetaText>
        <ListCard.MetaText>创建时间：{formatDateTime(item.createdAt)}</ListCard.MetaText>
        {item.reasonLabelSnapshot || item.reasonCode ? (
          <ListCard.MetaText>
            退货原因：
            {item.reasonLabelSnapshot ??
              (item.reasonCode ? (reasonLabelMap[item.reasonCode] ?? item.reasonCode) : '-')}
          </ListCard.MetaText>
        ) : null}
      </ListCard.Meta>
    </ListCard>
  );
});

const styles = StyleSheet.create({
  returnNo: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
});
