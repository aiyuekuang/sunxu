import React from 'react';
import { StyleSheet } from 'react-native';
import type { InternalIssueOrder } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import {
  INTERNAL_ISSUE_STATUS_CONFIG,
  INTERNAL_ISSUE_TYPE_CONFIG,
} from '../../../constants/status-configs';
import { FontSize } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatShortDateTime } from '../../../../core/utils/date';

interface InternalIssueCardProps {
  item: InternalIssueOrder;
  onPress: (id: string) => void;
}

export const InternalIssueCard = React.memo(function InternalIssueCard({
  item,
  onPress,
}: InternalIssueCardProps) {
  const { colors } = useTheme();
  const requesterName = item.requester?.realName || item.requester?.username;

  return (
    <ListCard onPress={() => onPress(item.id)}>
      <ListCard.Header>
        <Text style={[styles.issueNo, { color: colors.primary }]} numberOfLines={1}>
          {item.issueNo}
        </Text>
        <ConfigBadge value={item.status} config={INTERNAL_ISSUE_STATUS_CONFIG} size="sm" />
      </ListCard.Header>
      <ListCard.Title>
        {INTERNAL_ISSUE_TYPE_CONFIG[item.issueType]?.label ?? item.issueType}
      </ListCard.Title>
      <ListCard.Meta>
        {requesterName ? <ListCard.MetaText>领用人: {requesterName}</ListCard.MetaText> : null}
        {item.equipment ? <ListCard.MetaText>设备: {item.equipment.name}</ListCard.MetaText> : null}
        {item.fault ? <ListCard.MetaText>故障: {item.fault.faultNo}</ListCard.MetaText> : null}
        {item.workOrder ? (
          <ListCard.MetaText>工单: {item.workOrder.orderNo}</ListCard.MetaText>
        ) : null}
        <ListCard.MetaText>{formatShortDateTime(item.createdAt)}</ListCard.MetaText>
      </ListCard.Meta>
    </ListCard>
  );
});

const styles = StyleSheet.create({
  issueNo: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
});
