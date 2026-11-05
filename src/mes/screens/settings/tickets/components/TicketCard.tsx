import React from 'react';
import { StyleSheet } from 'react-native';
import type { Ticket } from '../../../../host/services';
import { AppText as Text } from '../../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../../core/components/ListCard.tsx';
import { TICKET_STATUS_CONFIG } from '../../../../constants/status-configs';
import { FontSize } from '../../../../../core/theme/tokens';
import { useTheme } from '../../../../../core/theme/useTheme';
import { formatDateTime } from '../../../../../core/utils/date';

interface TicketCardProps {
  item: Ticket;
  onPress: (id: number) => void;
}

export const TicketCard = React.memo(function TicketCard({ item, onPress }: TicketCardProps) {
  const { colors } = useTheme();
  return (
    <ListCard onPress={() => onPress(item.id)}>
      <ListCard.Header>
        <Text style={[styles.ticketNo, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.ticketNo}
        </Text>
        <ConfigBadge value={item.status} config={TICKET_STATUS_CONFIG} size="sm" />
      </ListCard.Header>
      <ListCard.Title>{item.title}</ListCard.Title>
      <ListCard.Meta>
        <ListCard.MetaText>{item.description}</ListCard.MetaText>
        <ListCard.MetaText>{formatDateTime(item.createdAt)}</ListCard.MetaText>
      </ListCard.Meta>
    </ListCard>
  );
});

const styles = StyleSheet.create({
  ticketNo: { fontSize: FontSize.sm, fontWeight: '500', flexShrink: 1 },
});
