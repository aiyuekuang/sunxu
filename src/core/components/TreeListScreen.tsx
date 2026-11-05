import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import axios from 'axios';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontSize, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import type { FlatNode } from '../tree/flat-node';
import { toast } from '../toast';
import { collectIds, flattenTree, searchTree, type TreeNode } from '../tree/tree-utils';
import { AppText as Text } from './AppText.tsx';
import { EmptyState } from './EmptyState.tsx';
import { FAB } from './FAB.tsx';
import { LoadingView } from './LoadingView.tsx';
import { PageHeader } from './PageHeader.tsx';
import { SearchBar } from './SearchBar.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Context passed to renderNode for expand/collapse control */
export interface TreeNodeContext {
  /** Whether the node is currently expanded */
  isExpanded: boolean;
  /** Toggle expand/collapse for this node */
  onToggle: () => void;
  /** 当前搜索关键字（供节点做搜索命中高亮）；无搜索时为空字符串 */
  keyword: string;
}

export interface TreeListScreenProps<T extends TreeNode> {
  /** Page title */
  title: string;
  /** Custom back handler */
  onBack?: () => void;
  /** Fetches tree data from API */
  fetchFn: () => Promise<T[]>;
  /** Renders a single tree node row */
  renderNode: (flatNode: FlatNode<T>, context: TreeNodeContext) => React.ReactElement;
  /** Fields to search on each node (for SearchBar filtering) */
  searchFields: (node: T) => string[];
  /** Search bar placeholder text */
  searchPlaceholder?: string;
  /** FAB add button handler */
  onAdd?: () => void;
  /** Show expand/collapse toolbar, default true */
  showToolbar?: boolean;
  /** Initial expansion mode on first load, default roots */
  initialExpandMode?: 'roots' | 'all' | 'none';
  /** Empty state icon name */
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  /** Empty state title */
  emptyTitle?: string;
  /** Right header content */
  headerRight?: React.ReactNode;
  /** Entity noun for count display, e.g. "工作中心" */
  countLabel?: string;
  /** 完全自定义 header（替换 PageHeader）；原生栈自带标题的页面传 `() => null` 避免双头 */
  renderHeader?: () => React.ReactNode;
  /** 暴露 refresh 给父组件（用于新增/编辑/删除等页面内动作完成后触发刷新） */
  onListDataReady?: (helpers: { refresh: () => void }) => void;
  /** Extra children (modals etc.) rendered outside the list */
  children?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TreeListScreen<T extends TreeNode>({
  title,
  onBack,
  fetchFn,
  renderNode,
  searchFields,
  searchPlaceholder = '搜索...',
  onAdd,
  showToolbar = true,
  initialExpandMode = 'roots',
  emptyIcon = 'git-branch-outline',
  emptyTitle = '暂无数据',
  headerRight,
  countLabel,
  renderHeader,
  onListDataReady,
  children,
}: TreeListScreenProps<T>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [treeData, setTreeData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState('');
  const skipNextFocus = useRef(true);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      try {
        const data = await fetchFn();
        setTreeData(data);
        // Initialize expansion state on first load only.
        if (!isRefresh) {
          const initialExpandedIds =
            initialExpandMode === 'all'
              ? new Set(collectIds(data))
              : initialExpandMode === 'none'
                ? new Set<string>()
                : new Set(data.map((n) => n.id));
          setExpandedIds(initialExpandedIds);
        }
      } catch (e: unknown) {
        if (axios.isCancel(e) || (e instanceof Error && e.message === 'canceled')) return;
        toast.error(e instanceof Error ? e.message : '加载失败');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchFn, initialExpandMode],
  );

  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    fetchData();
    hasLoadedOnce.current = true;
    skipNextFocus.current = true;
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      if (skipNextFocus.current) {
        skipNextFocus.current = false;
        return;
      }
      if (hasLoadedOnce.current) fetchData(true);
    }, [fetchData]),
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  useEffect(() => {
    onListDataReady?.({ refresh });
  }, [refresh, onListDataReady]);

  const allIds = useMemo(() => collectIds(treeData), [treeData]);

  const flatData = useMemo(() => {
    if (keyword) return searchTree(treeData, keyword, searchFields);
    return flattenTree(treeData, expandedIds);
  }, [treeData, expandedIds, keyword, searchFields]);

  const renderItem = useCallback(
    ({ item: flatNode }: { item: FlatNode<T> }) =>
      renderNode(flatNode, {
        isExpanded: expandedIds.has(flatNode.item.id),
        onToggle: () => toggleExpand(flatNode.item.id),
        keyword,
      }),
    [renderNode, expandedIds, toggleExpand, keyword],
  );

  const goBack = onBack ?? (() => navigation.goBack());

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader ? (
          renderHeader()
        ) : (
          <PageHeader title={title} onBack={goBack} right={headerRight} />
        )}
        <LoadingView />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader ? (
        renderHeader()
      ) : (
        <PageHeader title={title} onBack={goBack} right={headerRight} />
      )}

      <View
        style={[
          styles.searchWrap,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <SearchBar value={keyword} onChangeText={setKeyword} placeholder={searchPlaceholder} />
      </View>

      {showToolbar && (
        <View
          style={[
            styles.toolbar,
            { backgroundColor: colors.surface, borderBottomColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={() => setExpandedIds(new Set(allIds))}
          >
            <Ionicons name="expand-outline" size={15} color={colors.primary} />
            <Text style={[styles.toolbarText, { color: colors.primary }]}>展开全部</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.toolbarBtn} onPress={() => setExpandedIds(new Set())}>
            <Ionicons name="contract-outline" size={15} color={colors.textSecondary} />
            <Text style={[styles.toolbarText, { color: colors.textSecondary }]}>收起全部</Text>
          </TouchableOpacity>
          <View style={styles.flex1} />
          {countLabel && (
            <Text style={[styles.countText, { color: colors.textTertiary }]}>
              共 {allIds.length} 个{countLabel}
            </Text>
          )}
        </View>
      )}

      {flatData.length === 0 ? (
        <View style={styles.flex1}>
          <EmptyState icon={emptyIcon} title={emptyTitle} />
        </View>
      ) : (
        <FlashList<FlatNode<T>>
          data={flatData}
          renderItem={renderItem}
          keyExtractor={(flatNode: FlatNode<T>) => flatNode.item.id}
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: insets.bottom + 80 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchData(true)}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {onAdd && <FAB onPress={onAdd} />}
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  searchWrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  toolbarBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  toolbarText: { fontSize: FontSize.sm, fontWeight: '500' },
  divider: { width: StyleSheet.hairlineWidth, height: 16 },
  countText: { fontSize: FontSize.xs },
});
