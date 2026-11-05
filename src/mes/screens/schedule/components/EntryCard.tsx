import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { ScheduleEntry } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { Badge, ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { SCHEDULE_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatScheduleTime } from '../../../../core/utils/date';
import { formatBufferPolicySummary } from '../buffer-policy';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EntryCardProps {
  item: ScheduleEntry;
  onDelete?: () => void;
  onEdit?: () => void;
  onConfirm?: () => void;
  onUnconfirm?: () => void;
  /** 是否处于可选择状态 */
  selectable?: boolean;
  /** 是否已选中 */
  selected?: boolean;
  /** 切换选中状态 */
  onToggleSelect?: () => void;
}

type ScheduleEntryWithRuntime = ScheduleEntry & {
  occupiedStartAt?: string | null;
  occupiedEndAt?: string | null;
  actualEndAt?: string | null;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const EntryCard = React.memo(function EntryCard({
  item,
  onDelete,
  onEdit,
  onConfirm,
  onUnconfirm,
  selectable,
  selected,
  onToggleSelect,
}: EntryCardProps) {
  const { colors } = useTheme();
  const isBuffer = item.isBuffer === true;
  const start = new Date(item.plannedStart);
  const end = new Date(item.plannedEnd);
  const runtimeItem = item as ScheduleEntryWithRuntime;
  const occupiedStart = runtimeItem.occupiedStartAt ? new Date(runtimeItem.occupiedStartAt) : null;
  const occupiedEnd = runtimeItem.occupiedEndAt ? new Date(runtimeItem.occupiedEndAt) : null;
  const showActions = (item.status === 'scheduled' || item.status === 'confirmed') && !selectable;
  const materialName = item.workOrder?.material?.name?.trim();
  const workCenterName = item.workCenter?.name?.trim();
  const operationName = item.operation?.operationName?.trim();
  const title = materialName || workCenterName || '-';
  const subtitleParts: string[] = [];

  if (workCenterName && workCenterName !== title) {
    subtitleParts.push(`工作中心: ${workCenterName}`);
  }
  if (!isBuffer && operationName) {
    subtitleParts.push(`工序: ${operationName}`);
  }

  const subtitle = subtitleParts.join(' · ');
  const bufferSummary = formatBufferPolicySummary({
    minutes: item.workOrder?.scheduleBufferMinutes,
    ratio: item.workOrder?.scheduleBufferRatio,
    source: item.workOrder?.scheduleBufferSource,
  });
  const dependencyText = item.dependencyConflictReason ?? item.dependencyWarning ?? null;
  const hasDependencyConflict =
    item.dependencyConflict === true || Boolean(item.dependencyConflictReason);
  const dependencyTone = hasDependencyConflict ? colors.error : colors.warning;
  const dependencyHint = hasDependencyConflict
    ? item.status === 'confirmed'
      ? '先取消确认，再编辑调整；冲突清除后重新确认。'
      : '先编辑排产时间，冲突清除后才能确认。'
    : item.dependencyWarning
      ? '确认前核对转移批量或最小良品门槛。'
      : null;
  const canConfirm = item.status === 'scheduled' && !hasDependencyConflict;

  return (
    <ListCard
      style={
        isBuffer
          ? { borderColor: colors.textMuted, borderWidth: 1, opacity: 0.7 }
          : selected
            ? { borderColor: colors.primary, borderWidth: 1 }
            : undefined
      }
    >
      <ListCard.Header>
        <View style={styles.headerLeft}>
          {selectable && !isBuffer && (
            <TouchableOpacity
              onPress={(event) => {
                event.stopPropagation();
                onToggleSelect?.();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={selected ? 'checkbox' : 'square-outline'}
                size={20}
                color={selected ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          )}
          <ListCard.Code>
            {isBuffer ? `${item.workOrder?.orderNo ?? ''} 缓冲` : (item.workOrder?.orderNo ?? '-')}
          </ListCard.Code>
        </View>
        {isBuffer ? (
          <Text style={{ fontSize: FontSize.xs, color: colors.textMuted }}>缓冲时间</Text>
        ) : (
          <View style={styles.statusBadges}>
            <ConfigBadge value={item.status} config={SCHEDULE_STATUS_CONFIG} size="sm" />
            {item.reconfirmRequired && <Badge label="待重确认" variant="warning" size="sm" />}
          </View>
        )}
      </ListCard.Header>

      <ListCard.Title>{title}</ListCard.Title>

      {subtitle ? <ListCard.Subtitle>{subtitle}</ListCard.Subtitle> : null}

      <ListCard.Meta>
        <ListCard.MetaText>
          {formatScheduleTime(start)} — {formatScheduleTime(end)}
        </ListCard.MetaText>
        {occupiedStart && occupiedEnd && (
          <ListCard.MetaText>
            占用: {formatScheduleTime(occupiedStart)} — {formatScheduleTime(occupiedEnd)}
          </ListCard.MetaText>
        )}
        {runtimeItem.actualEndAt && new Date(runtimeItem.actualEndAt).getTime() < end.getTime() && (
          <ListCard.MetaText>
            已释放至 {formatScheduleTime(new Date(runtimeItem.actualEndAt))}
          </ListCard.MetaText>
        )}
        {item.durationMinutes != null && item.durationMinutes > 0 && (
          <ListCard.MetaText>
            工时:{' '}
            {item.durationMinutes >= 60
              ? `${Math.floor(item.durationMinutes / 60)}h ${item.durationMinutes % 60}min`
              : `${item.durationMinutes}min`}
          </ListCard.MetaText>
        )}
        {item.assignee && (
          <ListCard.MetaText>
            执行: {item.assignee.realName ?? item.assignee.username}
          </ListCard.MetaText>
        )}
        {item.predecessorSummary && (
          <ListCard.MetaText>前置: {item.predecessorSummary}</ListCard.MetaText>
        )}
        {bufferSummary && <ListCard.MetaText>缓冲: {bufferSummary}</ListCard.MetaText>}
      </ListCard.Meta>

      {dependencyText && (
        <View
          style={[
            styles.dependencyBox,
            { borderColor: `${dependencyTone}40`, backgroundColor: `${dependencyTone}10` },
          ]}
        >
          <Ionicons
            name={hasDependencyConflict ? 'alert-circle-outline' : 'information-circle-outline'}
            size={14}
            color={dependencyTone}
          />
          <View style={styles.dependencyContent}>
            <Text style={[styles.dependencyText, { color: colors.text }]} numberOfLines={3}>
              {dependencyText}
            </Text>
            {dependencyHint ? (
              <Text style={[styles.dependencyHint, { color: dependencyTone }]} numberOfLines={2}>
                {dependencyHint}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {showActions && (
        <ListCard.Actions>
          {canConfirm && onConfirm && !isBuffer && (
            <TouchableOpacity
              onPress={(event) => {
                event.stopPropagation();
                onConfirm();
              }}
              style={styles.actionBtn}
            >
              <Text style={[styles.actionText, { color: colors.success }]}>确认</Text>
            </TouchableOpacity>
          )}
          {item.status === 'confirmed' && onUnconfirm && !isBuffer && (
            <TouchableOpacity
              onPress={(event) => {
                event.stopPropagation();
                onUnconfirm();
              }}
              style={styles.actionBtn}
            >
              <Text style={[styles.actionText, { color: colors.warning }]}>取消确认</Text>
            </TouchableOpacity>
          )}
          {onEdit && !isBuffer && (
            <TouchableOpacity
              onPress={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              style={styles.actionBtn}
            >
              <Text style={[styles.actionText, { color: colors.primary }]}>编辑</Text>
            </TouchableOpacity>
          )}
          {onDelete && !isBuffer && (
            <TouchableOpacity
              onPress={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              style={styles.actionBtn}
            >
              <Text style={[styles.actionText, { color: colors.error }]}>删除</Text>
            </TouchableOpacity>
          )}
        </ListCard.Actions>
      )}
    </ListCard>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flex: 1 },
  statusBadges: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  dependencyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.sm,
  },
  dependencyContent: { flex: 1, gap: 2 },
  dependencyText: { fontSize: FontSize.xs, lineHeight: 16 },
  dependencyHint: { fontSize: FontSize.xs, lineHeight: 16, fontWeight: '500' },
  actionBtn: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.xs },
  actionText: { fontSize: FontSize.sm, fontWeight: '500' },
});
