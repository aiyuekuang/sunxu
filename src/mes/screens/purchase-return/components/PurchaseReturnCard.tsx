import React from 'react';
import { StyleSheet } from 'react-native';
import type { PurchaseReturn } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import {
  PURCHASE_RETURN_FINANCIAL_ACTION_CONFIG,
  PURCHASE_RETURN_STATUS_CONFIG,
} from '../../../constants/status-configs';
import { FontSize } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate } from '../../../../core/utils/date';
import { formatAmount, formatNumber } from '../../../../core/utils/format';

interface PurchaseReturnCardProps {
  item: PurchaseReturn;
  onPress: () => void;
}

export const PurchaseReturnCard = React.memo(function PurchaseReturnCard({
  item,
  onPress,
}: PurchaseReturnCardProps) {
  const { colors } = useTheme();
  const { mask, permitted: canViewPrices } = useAmountDisplay();
  const { labelMap: purchaseReturnReasonLabelMap } = useDict('purchase_return_reason');
  const { labelMap: legacySaleReturnReasonLabelMap } = useDict('sale_return_reason');
  const sourceLabel = item.sourceReceiptNo
    ? `采购入库单编号：${item.sourceReceiptNo}`
    : '来源：现存库存退料';

  return (
    <ListCard onPress={onPress}>
      <ListCard.Header>
        <Text style={[styles.returnNo, { color: colors.text }]} numberOfLines={1}>
          {item.returnNo}
        </Text>
        <ConfigBadge value={item.status} config={PURCHASE_RETURN_STATUS_CONFIG} size="sm" />
      </ListCard.Header>
      <ListCard.Title>
        {item.partnerNameSnapshot ?? item.supplierName ?? '未填写供应商'}
      </ListCard.Title>
      <ListCard.Meta>
        <ListCard.MetaText>{sourceLabel}</ListCard.MetaText>
        {item.outboundWarehouseName ? (
          <ListCard.MetaText>退库: {item.outboundWarehouseName}</ListCard.MetaText>
        ) : null}
        <ListCard.MetaText>
          申请: {item.returnDate ? formatDate(item.returnDate) : '-'}
        </ListCard.MetaText>
        {item.outboundDate ? (
          <ListCard.MetaText>出库: {formatDate(item.outboundDate)}</ListCard.MetaText>
        ) : null}
        {item.reversalDate ? (
          <ListCard.MetaText>冲正: {formatDate(item.reversalDate)}</ListCard.MetaText>
        ) : null}
        <ListCard.MetaText>退货: {formatNumber(item.totalReturnQty)}</ListCard.MetaText>
        {item.reasonLabelSnapshot || item.reasonCode ? (
          <ListCard.MetaText>
            原因:{' '}
            {item.reasonLabelSnapshot ??
              (item.reasonCode
                ? (purchaseReturnReasonLabelMap[item.reasonCode] ??
                  legacySaleReturnReasonLabelMap[item.reasonCode] ??
                  item.reasonCode)
                : '-')}
          </ListCard.MetaText>
        ) : null}
        {canViewPrices ? (
          <ConfigBadge
            value={item.financialAction}
            config={PURCHASE_RETURN_FINANCIAL_ACTION_CONFIG}
            size="sm"
          />
        ) : null}
        {canViewPrices && item.totalAmount != null ? (
          <ListCard.MetaText>{mask(formatAmount(item.totalAmount))}</ListCard.MetaText>
        ) : null}
      </ListCard.Meta>
    </ListCard>
  );
});

const styles = StyleSheet.create({
  returnNo: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
});
