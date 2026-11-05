import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText.tsx';
import { EmptyState } from './EmptyState.tsx';

/**
 * 下钻式树形选择器（DrillDownTreePicker）
 *
 * 适用场景：
 *   每层节点数量较多、可能需要分页加载的树形数据。
 *   每次只渲染当前层级列表，点击节点下钻到子级，顶部面包屑可回跳任意层级。
 *   例如：组织架构（集团→公司→部门→岗位）、区域选择（省→市→区）、
 *   大型物料分类、多层级仓库/仓位等。
 *
 * 不适用场景：
 *   数据总量小（< 100 节点）、层级少（2-3 层）、需要一眼看清全貌的树。
 *   这类场景请使用 FlashList + flattenTree 直接展开渲染（参考 WorkCenterScreen）。
 *
 * 两种模式对比：
 *   ┌──────────────────┬──────────────────────────┬─────────────────────────┐
 *   │                  │ DrillDownTreePicker       │ FlashList + flattenTree │
 *   ├──────────────────┼──────────────────────────┼─────────────────────────┤
 *   │ 数据量           │ 大 / 每层可分页          │ 小（< 100 节点）        │
 *   │ 交互方式         │ 逐层下钻，面包屑回跳     │ 展开/折叠，一屏纵览     │
 *   │ 渲染开销         │ 低（只渲染当前层）       │ 中（渲染所有展开节点）  │
 *   │ 典型场景         │ 弹窗选择器               │ 页面内树形列表          │
 *   └──────────────────┴──────────────────────────┴─────────────────────────┘
 */

/** 树节点基础类型 */
export interface TreePickerNode {
  id: string;
  name: string;
  children?: TreePickerNode[];
  /** 允许携带任意扩展字段，在 renderExtra 中使用 */
  [key: string]: unknown;
}

interface DrillDownTreePickerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** 树形数据 */
  data: TreePickerNode[];
  /** 当前选中的节点 ID */
  selectedId?: string;
  /** 需要排除的节点 ID（如编辑时排除自身） */
  excludeId?: string;
  /** 选中回调 */
  onSelect: (id: string, name: string) => void;
  /** 加载中 */
  loading?: boolean;
  /** 渲染列表项右侧额外信息 */
  renderExtra?: (item: TreePickerNode) => React.ReactNode;
  /** 是否允许选择非叶子节点，默认 true */
  allowSelectParent?: boolean;
}

/** 面包屑项 */
interface BreadcrumbItem {
  id: string | null; // null 表示根级
  name: string;
  children: TreePickerNode[];
}

export function DrillDownTreePicker({
  visible,
  onClose,
  title,
  data,
  selectedId,
  excludeId,
  onSelect,
  loading = false,
  renderExtra,
  allowSelectParent = true,
}: DrillDownTreePickerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // 导航栈：面包屑路径
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // 每次打开或 data 变化时重置到根级
  useEffect(() => {
    if (visible) {
      setBreadcrumbs([{ id: null, name: '全部', children: data }]);
    }
  }, [visible, data]);

  // 当前层级的数据
  const currentLevel = breadcrumbs[breadcrumbs.length - 1];
  const currentItems = useMemo(() => {
    if (!currentLevel) return [];
    return excludeId
      ? currentLevel.children.filter((n) => n.id !== excludeId)
      : currentLevel.children;
  }, [currentLevel, excludeId]);

  // 下钻到子级
  const drillDown = useCallback((node: TreePickerNode) => {
    setBreadcrumbs((prev) => [
      ...prev,
      { id: node.id, name: node.name, children: node.children || [] },
    ]);
  }, []);

  // 点击面包屑跳转到指定层级
  const jumpTo = useCallback((index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  }, []);

  // 选中节点
  const handleSelect = useCallback(
    (node: TreePickerNode) => {
      onSelect(node.id, node.name);
    },
    [onSelect],
  );

  const renderItem = useCallback(
    ({ item }: { item: TreePickerNode }) => {
      const hasChildren = !!item.children?.length;
      const isSelected = item.id === selectedId;

      return (
        <TouchableOpacity
          style={[
            styles.listItem,
            {
              backgroundColor: isSelected ? colors.primarySurface : colors.surface,
              borderBottomColor: colors.borderLight,
            },
          ]}
          onPress={() => {
            if (hasChildren) {
              drillDown(item);
            } else {
              handleSelect(item);
            }
          }}
          activeOpacity={0.6}
        >
          <View
            style={[
              styles.itemIcon,
              { backgroundColor: hasChildren ? `${colors.primary}15` : colors.border },
            ]}
          >
            <Ionicons
              name={hasChildren ? 'folder-outline' : 'document-outline'}
              size={16}
              color={hasChildren ? colors.primary : colors.textSecondary}
            />
          </View>
          <View style={styles.itemContent}>
            <Text
              style={[styles.itemName, { color: isSelected ? colors.primary : colors.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {renderExtra?.(item)}
          </View>
          {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
          {hasChildren && allowSelectParent && !isSelected && (
            <TouchableOpacity
              style={[styles.selectBtn, { borderColor: colors.primary }]}
              onPress={() => handleSelect(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.selectBtnText, { color: colors.primary }]}>选择</Text>
            </TouchableOpacity>
          )}
          {hasChildren && (
            <View style={styles.childIndicator}>
              <Text style={[styles.childCount, { color: colors.textTertiary }]}>
                {item.children?.length}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [colors, selectedId, drillDown, handleSelect, renderExtra, allowSelectParent],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[styles.sheet, { backgroundColor: colors.surface }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* 面包屑导航 */}
          {breadcrumbs.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.breadcrumbContainer}
              style={[styles.breadcrumbScroll, { borderBottomColor: colors.border }]}
            >
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <View key={crumb.id ?? 'root'} style={styles.breadcrumbItem}>
                    <TouchableOpacity onPress={() => !isLast && jumpTo(index)} disabled={isLast}>
                      <Text
                        style={[
                          styles.breadcrumbText,
                          {
                            color: isLast ? colors.primary : colors.textSecondary,
                            fontWeight: isLast ? '600' : '400',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {crumb.name}
                      </Text>
                    </TouchableOpacity>
                    {!isLast && (
                      <Ionicons
                        name="chevron-forward"
                        size={12}
                        color={colors.textTertiary}
                        style={{ marginHorizontal: 4 }}
                      />
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* 列表内容 */}
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : currentItems.length === 0 ? (
            <View style={styles.center}>
              <EmptyState icon="folder-open-outline" title="暂无数据" />
            </View>
          ) : (
            <FlatList<TreePickerNode>
              data={currentItems}
              renderItem={renderItem}
              keyExtractor={(item: TreePickerNode) => item.id}
              style={styles.list}
              contentContainerStyle={{ paddingBottom: insets.bottom || 16 }}
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  // 面包屑
  breadcrumbScroll: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexGrow: 0,
    flexShrink: 0,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 0,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: FontSize.sm,
  },
  // 列表
  list: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  selectBtn: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  selectBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  childIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  childCount: {
    fontSize: FontSize.xs,
  },
});
