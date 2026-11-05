import React from 'react';
import type { ToolingSession } from '../../../host/services';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { TOOLING_SESSION_STATUS } from '../../../constants/status-configs';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime } from '../../../../core/utils/date';

export interface ToolingSessionCardProps {
  item: ToolingSession;
}

export const ToolingSessionCard = React.memo(function ToolingSessionCard({
  item,
}: ToolingSessionCardProps) {
  const { colors } = useTheme();
  const lifeCountUnit = item.tooling?.lifeCountUnit || '次';
  return (
    <ListCard>
      <ListCard.Header>
        <ListCard.Title>
          {item.operator?.realName || item.operator?.username || '未知'}
        </ListCard.Title>
        <ConfigBadge value={item.status} config={TOOLING_SESSION_STATUS} size="sm" />
      </ListCard.Header>
      <ListCard.Subtitle>
        {formatDateTime(item.startedAt)}
        {item.endedAt ? ` → ${formatDateTime(item.endedAt)}` : ' → 使用中'}
      </ListCard.Subtitle>
      <ListCard.Meta>
        {item.equipment && (
          <ListCard.MetaText color={colors.textSecondary}>
            设备: {item.equipment.name}
          </ListCard.MetaText>
        )}
        {!item.equipment && (
          <ListCard.MetaText color={colors.textSecondary}>
            使用位置: {item.usageLocation ?? '位置未登记（历史记录）'}
          </ListCard.MetaText>
        )}
        {item.useCount != null && (
          <ListCard.MetaText color={colors.textSecondary}>
            手工补录寿命消耗: {item.useCount} {lifeCountUnit}
          </ListCard.MetaText>
        )}
        {item.useHours != null && (
          <ListCard.MetaText color={colors.textSecondary}>
            使用工时: {Number(item.useHours).toFixed(1)} h
          </ListCard.MetaText>
        )}
      </ListCard.Meta>
      {item.remark && <ListCard.Subtitle numberOfLines={2}>备注: {item.remark}</ListCard.Subtitle>}
    </ListCard>
  );
});
