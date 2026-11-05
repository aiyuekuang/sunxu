import React from 'react';
import { StyleSheet } from 'react-native';
import type { StockCountListItemDto } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { STOCK_COUNT_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatShortDateTime } from '../../../../core/utils/date';
import { formatNumber } from '../../../../core/utils/format';

interface StockCountCardProps {
  item: StockCountListItemDto;
  onPress: (id: string) => void;
}

export const StockCountCard = React.memo(function StockCountCard({
  item,
  onPress,
}: StockCountCardProps) {
  const { colors } = useTheme();
  const location = item.location?.name ?? item.storageLocationSnapshot;

  return (
    <ListCard onPress={() => onPress(item.id)}>
      <ListCard.Header>
        <Text style={[styles.countNo, { color: colors.primary }]} numberOfLines={1}>
          {item.countNo}
        </Text>
        <ConfigBadge value={item.status} config={STOCK_COUNT_STATUS_CONFIG} size="sm" />
      </ListCard.Header>
      <ListCard.Title>{item.warehouse?.name ?? '-'}</ListCard.Title>
      <ListCard.Meta>
        {location ? <ListCard.MetaText>仓位: {location}</ListCard.MetaText> : null}
        <ListCard.MetaText>方式: {item.countMode === 'blind' ? '盲盘' : '明盘'}</ListCard.MetaText>
        <ListCard.MetaText>盘点行: {item.lineCount}</ListCard.MetaText>
        {item.varianceLineCount > 0 ? (
          <ListCard.MetaText>
            差异: {item.varianceLineCount} 行 / Σ|差异|{' '}
            {formatNumber(item.varianceAbsQty, { fallback: '0', maximumFractionDigits: 4 })}
          </ListCard.MetaText>
        ) : null}
        <ListCard.MetaText>{formatShortDateTime(item.countDate)}</ListCard.MetaText>
      </ListCard.Meta>
    </ListCard>
  );
});

const styles = StyleSheet.create({
  countNo: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
});
