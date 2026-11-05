import React from 'react';
import type { ToolingUsageRecord } from '../../../host/services';
import { ToolingUsageRecordStatus } from '../../../types/models/ToolingUsageRecordStatus';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import {
  TOOLING_USAGE_RECORD_STATUS,
  TOOLING_USAGE_SOURCE_CONFIG,
} from '../../../constants/status-configs';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime } from '../../../../core/utils/date';

export interface ToolingUsageRecordCardProps {
  item: ToolingUsageRecord;
}

export const ToolingUsageRecordCard = React.memo(function ToolingUsageRecordCard({
  item,
}: ToolingUsageRecordCardProps) {
  const { colors } = useTheme();
  const sourceLabel = TOOLING_USAGE_SOURCE_CONFIG[item.source]?.label ?? item.source;
  const countUnit = item.countUnit || '次';
  const countSummary =
    item.status === ToolingUsageRecordStatus.REVERSED
      ? `寿命消耗 ${item.useCount} ${countUnit}，已全部冲回`
      : `寿命消耗 ${item.useCount} ${countUnit}，已冲回 ${item.reversedUseCount} ${countUnit}`;

  return (
    <ListCard>
      <ListCard.Header>
        <ListCard.Title>{sourceLabel}</ListCard.Title>
        <ConfigBadge value={item.status} config={TOOLING_USAGE_RECORD_STATUS} size="sm" />
      </ListCard.Header>
      <ListCard.Subtitle>{formatDateTime(item.occurredAt)}</ListCard.Subtitle>
      <ListCard.Meta>
        <ListCard.MetaText color={colors.textSecondary}>{countSummary}</ListCard.MetaText>
        {item.reportedProductQty != null && (
          <ListCard.MetaText color={colors.textSecondary}>
            来源报工产出：{item.reportedProductQty}
          </ListCard.MetaText>
        )}
        <ListCard.MetaText color={colors.textSecondary}>
          寿命周期：第 {item.lifeCycle} 周期
        </ListCard.MetaText>
        {item.operatorName && (
          <ListCard.MetaText color={colors.textSecondary}>
            操作人：{item.operatorName}
          </ListCard.MetaText>
        )}
      </ListCard.Meta>
      {(item.workOrderNo || item.workOrderOpName || item.materialName) && (
        <ListCard.Subtitle numberOfLines={2}>
          {[item.workOrderNo, item.materialName, item.workOrderOpName].filter(Boolean).join(' · ')}
        </ListCard.Subtitle>
      )}
      {item.remark && <ListCard.Subtitle numberOfLines={2}>说明：{item.remark}</ListCard.Subtitle>}
    </ListCard>
  );
});
