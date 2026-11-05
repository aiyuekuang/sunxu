import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text as RNText, TouchableOpacity, View } from 'react-native';
import { type TodoListItem, type TodoType, todoService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { SelectableChip } from '../../../../core/components/SelectableChip.tsx';
import { ENTITY_TYPE_CONFIG } from '../../../constants/status-configs';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET_ANDROID, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useTodoStore } from '../../../host/state/todo.store';
import { formatShortDateTime } from '../../../../core/utils/date';
import { buildEntityTypeCountChips } from '../../../utils/entity-type-tabs';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TodoSectionProps {
  /** 跳转待办中心 */
  onNavigateToTodo: (params?: { entityType?: string }) => void;
  /** 点击待办项 */
  onPressTodoItem: (item: TodoListItem) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_ITEMS = 5;
const ACTION_TODO_TYPES: TodoType[] = ['task', 'reminder'];

// ─── Component ────────────────────────────────────────────────────────────────

export function TodoSection({ onNavigateToTodo, onPressTodoItem }: TodoSectionProps) {
  const { colors } = useTheme();
  const todoCount = useTodoStore((s) => s.count);
  const [recentTodos, setRecentTodos] = useState<TodoListItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const totalCount = todoCount.task + todoCount.reminder;

  const loadRecentTodos = useCallback(async (entityType?: string) => {
    const res = await todoService.list({
      page: 1,
      pageSize: MAX_ITEMS,
      types: ACTION_TODO_TYPES,
      entityType,
    });
    setRecentTodos(res.list);
  }, []);

  useEffect(() => {
    if (totalCount === 0) {
      setRecentTodos([]);
      return;
    }
    if (activeFilter) {
      loadRecentTodos(activeFilter);
    } else {
      loadRecentTodos();
    }
  }, [activeFilter, loadRecentTodos, totalCount]);

  // chips：各业务模块（筛选待办列表）；未知类型保留原始码可见，禁止静默隐藏
  const chips = useMemo(
    () => buildEntityTypeCountChips(todoCount.byActionEntityType),
    [todoCount.byActionEntityType],
  );

  if (totalCount === 0) return null;

  const handleChipPress = (key: string) => {
    setActiveFilter((prev) => (prev === key ? null : key));
  };

  return (
    <View
      style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
    >
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>我的任务</Text>
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: `${colors.error}10`,
                borderColor: `${colors.error}24`,
              },
            ]}
          >
            <RNText
              numberOfLines={1}
              allowFontScaling={false}
              style={[styles.countText, { color: colors.error }]}
            >
              {totalCount > 99 ? '99+' : totalCount}
            </RNText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.seeAllButton}
          activeOpacity={0.7}
          hitSlop={HIT_SLOP}
          onPress={() => {
            if (activeFilter) {
              onNavigateToTodo({ entityType: activeFilter });
            } else {
              onNavigateToTodo();
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="查看全部我的任务"
        >
          <Ionicons accessible={false} name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 类型 chips */}
      {chips.length > 0 && (
        <View style={styles.statsRow}>
          {chips.map((chip) => (
            <SelectableChip
              key={chip.key}
              label={chip.count > 0 ? `${chip.label} ${chip.count}` : chip.label}
              selected={activeFilter === chip.key}
              onPress={() => handleChipPress(chip.key)}
            />
          ))}
        </View>
      )}

      {/* 列表 */}
      {recentTodos.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>暂无此类待办</Text>
      ) : (
        recentTodos.map((item) => (
          <TodoRow key={item.id} item={item} onPress={() => onPressTodoItem(item)} />
        ))
      )}
    </View>
  );
}

// ─── TodoRow ─────────────────────────────────────────────────────────────────

const TodoRow = React.memo(function TodoRow({
  item,
  onPress,
}: {
  item: TodoListItem;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const isHigh = item.priority === 'high';
  // 优先展示截止日期，没有则展示创建时间
  const timeLabel = item.dueDate
    ? `截止 ${formatShortDateTime(item.dueDate)}`
    : formatShortDateTime(item.createdAt);

  return (
    <TouchableOpacity
      style={[styles.row, { borderTopColor: colors.borderLight }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* 高优先级红点 */}
      {isHigh ? <View style={[styles.priorityDot, { backgroundColor: colors.error }]} /> : null}
      <View style={styles.rowContent}>
        <View style={styles.rowTitleRow}>
          <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          {item.entityType ? (
            <ConfigBadge
              value={item.entityType}
              config={ENTITY_TYPE_CONFIG}
              size="sm"
              fallbackLabel={item.entityType}
            />
          ) : null}
        </View>
        <View style={styles.rowMeta}>
          {item.documentNo ? (
            <Text style={[styles.rowSub, { color: colors.textTertiary }]} numberOfLines={1}>
              {item.documentNo}
            </Text>
          ) : null}
          {item.assignerName ? (
            <Text style={[styles.rowSub, { color: colors.textTertiary }]} numberOfLines={1}>
              {item.assignerName}
            </Text>
          ) : null}
          <Text
            style={[
              styles.rowSub,
              { color: item.isOverdue ? colors.error : colors.textTertiary },
              item.isOverdue && styles.overdueText,
            ]}
            numberOfLines={1}
          >
            {item.isOverdue ? '已逾期 · ' : ''}
            {timeLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    lineHeight: 13,
  },
  seeAllButton: {
    minWidth: MIN_TOUCH_TARGET_ANDROID,
    minHeight: MIN_TOUCH_TARGET_ANDROID,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  emptyText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  rowContent: { flex: 1 },
  rowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rowTitle: { fontSize: FontSize.base, flex: 1 },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  rowSub: { fontSize: FontSize.xs },
  overdueText: { fontWeight: '600' },
});
