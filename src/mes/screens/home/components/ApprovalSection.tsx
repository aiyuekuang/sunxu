import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text as RNText, TouchableOpacity, View } from 'react-native';
import { approvalService, type PendingApprovalItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ENTITY_TYPE_CONFIG } from '../../../constants/status-configs';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET_ANDROID, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useTodoStore } from '../../../host/state/todo.store';
import { formatShortDateTime } from '../../../../core/utils/date';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApprovalSectionProps {
  /** 点击"查看全部"跳转审批中心 */
  onNavigateToApproval: () => void;
  /** 点击审批项跳转对应详情 */
  onPressItem: (item: PendingApprovalItem) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_ITEMS = 5;

// ─── Component ────────────────────────────────────────────────────────────────

export function ApprovalSection({ onNavigateToApproval, onPressItem }: ApprovalSectionProps) {
  const { colors } = useTheme();
  const approvalCount = useTodoStore((s) => s.count.approval);
  const [items, setItems] = useState<PendingApprovalItem[]>([]);

  const loadItems = useCallback(async () => {
    const res = await approvalService.pendingList({ page: 1, pageSize: MAX_ITEMS });
    setItems(res.list);
  }, []);

  useEffect(() => {
    if (approvalCount > 0) {
      loadItems();
    } else {
      setItems([]);
    }
  }, [loadItems, approvalCount]);

  if (approvalCount === 0) return null;

  return (
    <View
      style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
    >
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>待审批</Text>
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: `${colors.primary}10`,
                borderColor: `${colors.primary}24`,
              },
            ]}
          >
            <RNText
              numberOfLines={1}
              allowFontScaling={false}
              style={[styles.countText, { color: colors.primary }]}
            >
              {approvalCount > 99 ? '99+' : approvalCount}
            </RNText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.seeAllButton}
          activeOpacity={0.7}
          hitSlop={HIT_SLOP}
          onPress={onNavigateToApproval}
          accessibilityRole="button"
          accessibilityLabel="查看全部待审批"
        >
          <Ionicons accessible={false} name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 列表 */}
      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>加载中...</Text>
      ) : (
        items.map((item) => (
          <ApprovalRow key={item.id} item={item} onPress={() => onPressItem(item)} />
        ))
      )}
    </View>
  );
}

// ─── ApprovalRow ──────────────────────────────────────────────────────────────

const ApprovalRow = React.memo(function ApprovalRow({
  item,
  onPress,
}: {
  item: PendingApprovalItem;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.row, { borderTopColor: colors.borderLight }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.rowContent}>
        <View style={styles.rowTitleRow}>
          <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
            {item.entityLabel || item.documentNo}
          </Text>
          <ConfigBadge value={item.entityType} config={ENTITY_TYPE_CONFIG} size="sm" />
        </View>
        <View style={styles.rowMeta}>
          <Text style={[styles.rowSub, { color: colors.textTertiary }]} numberOfLines={1}>
            {item.stepLabel}（{item.currentStep}/{item.totalSteps}）
          </Text>
          {item.submitterName ? (
            <Text style={[styles.rowSub, { color: colors.textTertiary }]} numberOfLines={1}>
              {item.submitterName}
            </Text>
          ) : null}
          <Text style={[styles.rowSub, { color: colors.textTertiary }]} numberOfLines={1}>
            {formatShortDateTime(item.submittedAt)}
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
});
