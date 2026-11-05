import { memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import type { TemporaryWorker } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { TEMPORARY_WORKER_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate } from '../../../../core/utils/date';
import type { TemporaryWorkerStatus } from '../worker-status';

export const TemporaryWorkerCard = memo(function TemporaryWorkerCard({
  worker,
  status,
  onEdit,
  onDeactivate,
}: {
  worker: TemporaryWorker;
  status: TemporaryWorkerStatus;
  onEdit?: () => void;
  onDeactivate?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <ListCard accessibilityLabel={`${worker.name}，手机号 ${worker.phone}`}>
      <ListCard.Header>
        <ListCard.Title>{worker.name}</ListCard.Title>
        <ConfigBadge value={status} config={TEMPORARY_WORKER_STATUS_CONFIG} size="sm" />
      </ListCard.Header>
      <ListCard.Meta>
        <ListCard.MetaText>{`手机号：${worker.phone}`}</ListCard.MetaText>
        <ListCard.MetaText>{`合作截止日：${worker.validUntil ? formatDate(worker.validUntil) : '待补录'}`}</ListCard.MetaText>
      </ListCard.Meta>
      {worker.remark ? <ListCard.Subtitle>{worker.remark}</ListCard.Subtitle> : null}
      {onEdit || onDeactivate ? (
        <ListCard.Actions>
          {onEdit ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`编辑临时工${worker.name}`}
              style={[styles.actionButton, { borderColor: colors.border }]}
              onPress={(event) => {
                event.stopPropagation();
                onEdit();
              }}
            >
              <Text style={[styles.actionText, { color: colors.primary }]}>编辑</Text>
            </TouchableOpacity>
          ) : null}
          {onDeactivate ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`停用临时工${worker.name}`}
              style={[styles.actionButton, { borderColor: colors.error }]}
              onPress={(event) => {
                event.stopPropagation();
                onDeactivate();
              }}
            >
              <Text style={[styles.actionText, { color: colors.error }]}>停用</Text>
            </TouchableOpacity>
          ) : null}
        </ListCard.Actions>
      ) : null}
    </ListCard>
  );
});

const styles = StyleSheet.create({
  actionButton: {
    minHeight: 44,
    minWidth: 64,
    paddingHorizontal: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontSize: FontSize.sm, fontWeight: '600' },
});
