import React from 'react';
import { StyleSheet } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { COST_SOURCE_CONFIG } from '../../../constants/status-configs';
import { FontSize } from '../../../../core/theme/tokens';
import type { ProfitabilityTrialItem } from '../../../host/services';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatAmount, formatNumber } from '../../../../core/utils/format';

interface ProfitabilityTrialCardProps {
  item: ProfitabilityTrialItem;
  mask: (value: string) => string;
}

export const ProfitabilityTrialCard = React.memo(function ProfitabilityTrialCard({
  item,
  mask,
}: ProfitabilityTrialCardProps) {
  const { colors } = useTheme();
  const marginPositive = item.grossMarginRate >= 0;
  const hasCostBasis = item.hasCostBasis;
  const costSourceLabel = COST_SOURCE_CONFIG[item.costSource];
  const costWarningCount = item.costWarnings?.length ?? 0;

  return (
    <ListCard>
      <ListCard.Header>
        <ListCard.Code>{item.materialCode || '未编码物料'}</ListCard.Code>
        <Text
          style={[
            styles.marginText,
            {
              color: hasCostBasis
                ? marginPositive
                  ? colors.success
                  : colors.error
                : colors.warning,
            },
          ]}
        >
          {hasCostBasis ? `${item.grossMarginRate.toFixed(2)}%` : '缺成本依据'}
        </Text>
      </ListCard.Header>
      <ListCard.Title>{item.materialName || '未命名物料'}</ListCard.Title>
      <ListCard.Meta>
        <ListCard.MetaText>{`销售 ${mask(formatAmount(item.salesAmount))}`}</ListCard.MetaText>
        <ListCard.MetaText>
          {`成本 ${hasCostBasis ? mask(formatAmount(item.estimatedCostAmount)) : '--'}`}
        </ListCard.MetaText>
        <ListCard.MetaText
          color={hasCostBasis ? (marginPositive ? colors.success : colors.error) : colors.warning}
        >
          {`毛利 ${hasCostBasis ? mask(formatAmount(item.estimatedGrossProfit)) : '--'}`}
        </ListCard.MetaText>
      </ListCard.Meta>
      <ListCard.Meta>
        <ListCard.MetaText>{`销售数量 ${formatNumber(item.salesQty)}`}</ListCard.MetaText>
        <ListCard.MetaText>{`采购数量 ${formatNumber(item.purchaseQty)}`}</ListCard.MetaText>
      </ListCard.Meta>
      <ListCard.Meta>
        <ListCard.MetaText>{`成本来源 ${costSourceLabel}`}</ListCard.MetaText>
        {costWarningCount > 0 ? (
          <ListCard.MetaText color={colors.warning}>
            {`成本提示 ${costWarningCount} 条`}
          </ListCard.MetaText>
        ) : null}
      </ListCard.Meta>
    </ListCard>
  );
});

const styles = StyleSheet.create({
  marginText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
