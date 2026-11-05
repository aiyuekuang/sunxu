import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { TodoListItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import {
  ENTITY_TYPE_CONFIG,
  TODO_PRIORITY_CONFIG,
  TODO_STATUS_CONFIG,
} from '../../../constants/status-configs';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate } from '../../../../core/utils/date';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TodoCardProps {
  item: TodoListItem;
  onPress: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TodoCard = React.memo(function TodoCard({
  item,
  onPress,
  onStart,
  onComplete,
  onCancel,
}: TodoCardProps) {
  const { colors, isDark } = useTheme();
  const titleContainsDocNo = item.documentNo && item.title.includes(item.documentNo);
  const plannedEndAt = item.plannedEndAt ?? item.dueDate;
  const actionInk = isDark
    ? { primary: colors.primary, error: colors.error, success: colors.success }
    : { primary: '#1665ED', error: '#D23141', success: '#008364' };
  const hasDirectActions =
    (item.canStart && !!onStart) ||
    (item.canComplete && !!onComplete) ||
    (item.canCancel && !!onCancel);

  return (
    <ListCard onPress={onPress}>
      <ListCard.Header>
        {!titleContainsDocNo && item.documentNo ? (
          <ListCard.Code>{item.documentNo}</ListCard.Code>
        ) : null}
        <View style={styles.badges}>
          {item.entityType ? (
            <ConfigBadge
              value={item.entityType}
              config={ENTITY_TYPE_CONFIG}
              size="sm"
              fallbackLabel={item.entityType}
            />
          ) : null}
          {item.priority === 'high' ? (
            <ConfigBadge value="high" config={TODO_PRIORITY_CONFIG} size="sm" />
          ) : null}
          <ConfigBadge value={item.status} config={TODO_STATUS_CONFIG} size="sm" />
        </View>
      </ListCard.Header>
      <ListCard.Title>{item.title}</ListCard.Title>
      {item.content && item.content.trim() !== item.title.trim() ? (
        <Text style={[styles.content, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.content}
        </Text>
      ) : null}
      <ListCard.Meta>
        {item.isOverdue ? (
          <Text style={[styles.overdue, { color: colors.error }]}>已逾期</Text>
        ) : null}
        {item.assignerName ? (
          <ListCard.MetaText>指派人: {item.assignerName}</ListCard.MetaText>
        ) : null}
        {item.assigneeName ? (
          <ListCard.MetaText>负责人: {item.assigneeName}</ListCard.MetaText>
        ) : null}
        {plannedEndAt ? (
          <ListCard.MetaText>计划完成: {formatDate(plannedEndAt)}</ListCard.MetaText>
        ) : null}
        <ListCard.MetaText>{formatDate(item.createdAt)}</ListCard.MetaText>
      </ListCard.Meta>
      {item.actionHint || hasDirectActions ? (
        <ListCard.Actions>
          {item.actionHint ? (
            <Text style={[styles.actionHint, { color: colors.warning }]} numberOfLines={2}>
              {item.actionHint}
            </Text>
          ) : null}
          {item.canStart && onStart ? (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={(event) => {
                event.stopPropagation();
                onStart();
              }}
              style={styles.actionHitArea}
              hitSlop={2}
            >
              <View
                style={[
                  styles.actionVisual,
                  { backgroundColor: colors.primarySurface, borderColor: actionInk.primary },
                ]}
              >
                <Text style={[styles.actionText, { color: actionInk.primary }]}>开始</Text>
              </View>
            </TouchableOpacity>
          ) : null}
          {item.canCancel && onCancel ? (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={(event) => {
                event.stopPropagation();
                onCancel();
              }}
              style={styles.actionHitArea}
              hitSlop={2}
            >
              <View
                style={[
                  styles.actionVisual,
                  { backgroundColor: colors.errorLight, borderColor: actionInk.error },
                ]}
              >
                <Text style={[styles.actionText, { color: actionInk.error }]}>取消</Text>
              </View>
            </TouchableOpacity>
          ) : null}
          {item.canComplete && onComplete ? (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={(event) => {
                event.stopPropagation();
                onComplete();
              }}
              style={styles.actionHitArea}
              hitSlop={2}
            >
              <View
                style={[
                  styles.actionVisual,
                  { backgroundColor: colors.successLight, borderColor: actionInk.success },
                ]}
              >
                <Text style={[styles.actionText, { color: actionInk.success }]}>完成</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </ListCard.Actions>
      ) : null}
    </ListCard>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badges: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  overdue: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  content: {
    marginTop: Spacing.xs,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  actionHint: {
    flex: 1,
    flexShrink: 1,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  actionHitArea: {
    minWidth: 64,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionVisual: {
    minWidth: 64,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
