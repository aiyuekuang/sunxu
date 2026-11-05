import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { permissionService } from '../../../../host/services';
import type { PermissionNode } from '../../../../host/api-types';
import { AppText as Text } from '../../../../../core/components/AppText.tsx';
import { LoadingView } from '../../../../../core/components/LoadingView.tsx';
import { PERMISSION_NODE_COLORS as NODE_COLORS } from '../../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../../core/theme/tokens';
import { useTheme } from '../../../../../core/theme/useTheme';
import type { FlatNode } from '../../../../../core/tree/flat-node';
import { toast, toastConfig } from '../../../../../core/toast';
import { collectIds, flattenTree } from '../../../../../core/tree/tree-utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserPermissionsModalProps {
  visible: boolean;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countNodes(nodes: PermissionNode[]): number {
  let count = 0;
  for (const n of nodes) {
    count += 1 + (n.children ? countNodes(n.children) : 0);
  }
  return count;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserPermissionsModal({ visible, onClose }: UserPermissionsModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [allNodes, setAllNodes] = useState<PermissionNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible || allNodes.length > 0) return;
    setLoading(true);
    permissionService
      .myPermissionTree()
      .then((tree) => {
        setAllNodes(tree);
        setExpandedIds(new Set(collectIds(tree)));
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [visible, allNodes.length]);

  const filteredTree = allNodes;
  const totalCount = useMemo(() => countNodes(filteredTree), [filteredTree]);
  const allFilteredIds = useMemo(() => collectIds(filteredTree), [filteredTree]);
  const flatData = useMemo(
    () => flattenTree(filteredTree, expandedIds),
    [filteredTree, expandedIds],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const renderItem = useCallback(
    ({ item: flatNode }: { item: FlatNode<PermissionNode> }) => {
      const { item: node, depth, hasChildren } = flatNode;
      const isExpanded = expandedIds.has(node.id);
      const nodeColor = NODE_COLORS[depth % NODE_COLORS.length];
      const indent = depth * 16;

      return (
        <TouchableOpacity
          style={[
            styles.nodeRow,
            {
              paddingLeft: Spacing.md + indent,
              borderBottomColor: colors.borderLight,
              backgroundColor: depth === 0 ? `${colors.primarySurface}50` : 'transparent',
            },
          ]}
          onPress={() => (hasChildren ? toggleExpand(node.id) : undefined)}
          activeOpacity={hasChildren ? 0.7 : 1}
        >
          {Array.from({ length: depth }).map((_, i) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: indent lines are positional with no unique id
              key={`indent-${i}`}
              style={[
                styles.indentLine,
                { left: Spacing.md + i * 16 + 9, backgroundColor: colors.border },
              ]}
            />
          ))}

          {hasChildren ? (
            <View style={[styles.groupIcon, { backgroundColor: `${nodeColor}20` }]}>
              <Ionicons name={depth === 0 ? 'apps' : 'folder'} size={13} color={nodeColor} />
            </View>
          ) : (
            <View style={[styles.leafDot, { backgroundColor: nodeColor }]} />
          )}

          <View style={styles.nodeInfo}>
            <Text
              style={[
                styles.nodeName,
                { color: colors.text, fontWeight: hasChildren ? '600' : '400' },
              ]}
            >
              {node.name}
            </Text>
            {!!node.description && (
              <Text style={[styles.nodeDesc, { color: colors.textTertiary }]} numberOfLines={1}>
                {node.description}
              </Text>
            )}
          </View>

          {hasChildren && (
            <View style={styles.expandRow}>
              <Text style={[styles.childCount, { color: colors.textTertiary }]}>
                {node.children?.length}
              </Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.textTertiary}
              />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [colors, expandedIds, toggleExpand],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + Spacing.md,
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primarySurface }]}>
              <Ionicons name="key" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>我的权限</Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                共 {filteredTree.length} 个模块 · {totalCount} 个权限节点
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.expandBtn, { borderColor: colors.border }]}
              onPress={() => setExpandedIds(new Set(allFilteredIds))}
            >
              <Ionicons name="expand-outline" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.expandBtn, { borderColor: colors.border }]}
              onPress={() => setExpandedIds(new Set())}
            >
              <Ionicons name="contract-outline" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <LoadingView />
        ) : (
          <FlashList<FlatNode<PermissionNode>>
            data={flatData}
            renderItem={renderItem}
            keyExtractor={(fn) => fn.item.id}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          />
        )}

        <Toast config={toastConfig} topOffset={Math.max(insets.top, Spacing.base) + Spacing.sm} />
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.base, fontWeight: '600' },
  headerSub: { fontSize: FontSize.sm, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  expandBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  indentLine: { position: 'absolute', width: 1, top: 0, bottom: 0 },
  leafDot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 5 },
  groupIcon: {
    width: 24,
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  nodeInfo: { flex: 1, gap: 1 },
  nodeName: { fontSize: FontSize.base },
  nodeDesc: { fontSize: FontSize.sm },
  expandRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  childCount: { fontSize: FontSize.sm },
});
