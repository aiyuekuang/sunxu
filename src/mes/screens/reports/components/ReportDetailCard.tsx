import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ReportDetailCode, ReportDetailRow } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { Badge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { REPORT_STATUS_CONFIG } from '../../../constants/report-detail-configs';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatDate } from '../../../../core/utils/date';
import { formatAmount } from '../../../../core/utils/format';
import { formatQtyWithUnit, formatUnitLabel } from '../../../utils/qty-unit';

interface ReportDetailCardProps {
  code: ReportDetailCode;
  item: ReportDetailRow;
  priceVisible: boolean;
}

function quantityLabel(code: ReportDetailCode): string {
  if (code === 'sale_delivery_detail') return '发生数量';
  if (code === 'purchase_receipt_detail') return '有效入库';
  if (code === 'purchase_order_detail') return '订购数量';
  return '订购数量';
}

function amountLabel(code: ReportDetailCode): string {
  if (code === 'sale_delivery_detail') return '发生金额';
  return code === 'purchase_receipt_detail' ? '有效金额' : '价税合计';
}

function ReportDetailCardInner({ code, item, priceVisible }: ReportDetailCardProps) {
  const { colors } = useTheme();
  const { mask } = useAmountDisplay({ permitted: priceVisible });
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const statusConfig = REPORT_STATUS_CONFIG[item.status];
  const unitLabel = formatUnitLabel(item.unit, unitLabelMap);
  const quantity =
    code === 'purchase_receipt_detail'
      ? (item.effectiveQty ?? item.ledgerQty)
      : code === 'sale_delivery_detail'
        ? item.ledgerQty
        : item.quantity;
  const amount =
    code === 'sale_delivery_detail'
      ? item.amount
      : code === 'purchase_receipt_detail'
        ? item.effectiveAmount
        : item.totalAmount;

  return (
    <ListCard>
      <ListCard.Header>
        <ListCard.Code>{item.documentNo}</ListCard.Code>
        <Badge
          label={statusConfig?.label ?? '未知状态'}
          variant={statusConfig?.variant ?? 'default'}
          size="sm"
        />
      </ListCard.Header>
      <ListCard.Title>{item.materialName}</ListCard.Title>
      <ListCard.Subtitle>
        {[item.materialCode, item.materialSpec, unitLabel].filter(Boolean).join(' · ')}
      </ListCard.Subtitle>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.partnerName}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatDate(item.date)}
          </Text>
        </View>
      </View>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="cube-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.warehouseName}
          </Text>
        </View>
        {item.sourceNo !== '-' && (
          <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={2}>
            来源：{item.sourceNo}
          </Text>
        )}
      </View>
      <View style={[styles.amountRow, { borderTopColor: colors.borderLight }]}>
        <View>
          <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
            {quantityLabel(code)}
          </Text>
          <Text style={[styles.quantity, { color: colors.text }]}>
            {formatQtyWithUnit(quantity, item.unit, unitLabelMap)}
          </Text>
        </View>
        {code === 'sale_delivery_detail' && item.reversedQty !== null && (
          <View>
            <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>冲正数量</Text>
            <Text style={[styles.secondaryValue, { color: colors.error }]}>
              {formatQtyWithUnit(item.reversedQty, item.unit, unitLabelMap)}
            </Text>
          </View>
        )}
        {code === 'purchase_receipt_detail' && item.returnedQty !== null && (
          <View>
            <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>退料数量</Text>
            <Text style={[styles.secondaryValue, { color: colors.warning }]}>
              {formatQtyWithUnit(item.returnedQty, item.unit, unitLabelMap)}
            </Text>
          </View>
        )}
        {code === 'purchase_order_detail' && item.outstandingQty !== null && (
          <View>
            <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>待收数量</Text>
            <Text style={[styles.secondaryValue, { color: colors.warning }]}>
              {formatQtyWithUnit(item.outstandingQty, item.unit, unitLabelMap)}
            </Text>
          </View>
        )}
        <View style={styles.amountValue}>
          <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
            {amountLabel(code)}
          </Text>
          <Text style={[styles.amount, { color: colors.primary }]}>
            {!priceVisible ? '—' : amount === null ? '未定价' : mask(formatAmount(amount))}
          </Text>
        </View>
      </View>
      {item.batchNo !== '-' && (
        <Text style={[styles.footnote, { color: colors.textSecondary }]}>批号：{item.batchNo}</Text>
      )}
    </ListCard>
  );
}

export const ReportDetailCard = React.memo(ReportDetailCardInner);

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 1,
  },
  metaText: {
    fontSize: FontSize.xs,
    flexShrink: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  valueLabel: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.xs,
  },
  quantity: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  secondaryValue: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  amountValue: {
    alignItems: 'flex-end',
    marginLeft: 'auto',
  },
  amount: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  footnote: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
});
