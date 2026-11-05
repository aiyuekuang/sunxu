import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Department } from '../../../../host/api-types';
import { AppText as Text } from '../../../../../core/components/AppText.tsx';
import { Badge } from '../../../../../core/components/Badge.tsx';
import { SwipeableRow } from '../../../../../core/components/SwipeableRow.tsx';
import { FontSize, Radius, Spacing } from '../../../../../core/theme/tokens';
import { useTheme } from '../../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DepartmentNodeProps {
  /** 部门数据 */
  dept: Department;
  /** 树层级深度 */
  depth: number;
  /** 是否有子节点 */
  hasChildren: boolean;
  /** 是否已展开 */
  isExpanded: boolean;
  /** 是否为搜索匹配项 */
  isSearchMatch?: boolean;
  /** 展开/收起切换 */
  onToggle: () => void;
  /** 添加子部门 */
  onAddChild?: () => void;
  /** 编辑部门 */
  onEdit?: () => void;
  /** 删除部门 */
  onDelete?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DepartmentNode = React.memo(function DepartmentNode({
  dept,
  depth,
  hasChildren,
  isExpanded,
  isSearchMatch,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
}: DepartmentNodeProps) {
  const { colors } = useTheme();

  const swipeActions = [
    ...(onAddChild
      ? [{ label: '子部门', icon: 'add' as const, color: colors.primary, onPress: onAddChild }]
      : []),
    ...(onEdit
      ? [
          {
            label: '编辑',
            icon: 'create-outline' as const,
            color: colors.textSecondary,
            onPress: onEdit,
          },
        ]
      : []),
    ...(onDelete
      ? [{ label: '删除', icon: 'trash-outline' as const, color: colors.error, onPress: onDelete }]
      : []),
  ];

  return (
    <View style={[styles.wrapper, { marginLeft: depth * 20 }]}>
      {/* 子节点左侧的竖线连接符 */}
      {depth > 0 && <View style={[styles.treeLine, { backgroundColor: colors.border }]} />}
      <SwipeableRow rightActions={swipeActions} onPress={hasChildren ? onToggle : undefined}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: isSearchMatch ? colors.primary : colors.borderLight,
            },
            isSearchMatch && { backgroundColor: colors.primarySurface },
          ]}
        >
          {/* 展开/收起箭头 */}
          <View style={styles.expandArea}>
            {hasChildren ? (
              <Ionicons
                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                size={14}
                color={colors.textTertiary}
              />
            ) : (
              <View style={styles.leafDot}>
                <View style={[styles.dot, { backgroundColor: colors.border }]} />
              </View>
            )}
          </View>

          {/* 部门信息 */}
          <View style={styles.info}>
            <Text
              style={[styles.name, { color: isSearchMatch ? colors.primary : colors.text }]}
              numberOfLines={1}
            >
              {dept.name}
            </Text>
            {dept.leader?.realName ? (
              <Text style={[styles.leader, { color: colors.textTertiary }]} numberOfLines={1}>
                {dept.leader.realName}
              </Text>
            ) : null}
          </View>

          {/* 状态 */}
          <Badge
            label={dept.status === 1 ? '启用' : '停用'}
            variant={dept.status === 1 ? 'success' : 'default'}
            size="sm"
          />
        </View>
      </SwipeableRow>
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.xs,
    position: 'relative',
  },
  treeLine: {
    position: 'absolute',
    left: -10,
    top: 0,
    bottom: 0,
    width: 2,
    borderRadius: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  expandArea: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafDot: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  leader: {
    fontSize: FontSize.sm,
  },
});
