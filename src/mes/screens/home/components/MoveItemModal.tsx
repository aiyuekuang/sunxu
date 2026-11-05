import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MoveItemTarget {
  /** 分组标题 */
  title: string;
  /** 是否是该菜单项当前所在分组 */
  isCurrent: boolean;
}

export interface MoveItemModalProps {
  visible: boolean;
  /** 正在移动的菜单项名称，用于显示 */
  itemLabel: string;
  /** 可选的目标分组列表 */
  targets: MoveItemTarget[];
  onClose: () => void;
  /** 选择目标分组后回调，传 null 表示恢复默认分组 */
  onSelect: (groupTitle: string | null) => void;
  /** 原始默认分组标题，用于显示"恢复默认" */
  defaultGroupTitle: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MoveItemModal({
  visible,
  itemLabel,
  targets,
  onClose,
  onSelect,
  defaultGroupTitle,
}: MoveItemModalProps) {
  const { colors } = useTheme();

  const handleSelect = (title: string | null) => {
    onSelect(title);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={`移动「${itemLabel}」`} dynamicHeight>
      <View style={styles.container}>
        <Text style={[styles.hint, { color: colors.textMuted }]}>选择目标分组</Text>

        {targets.map((target) => (
          <TouchableOpacity
            key={target.title}
            style={[
              styles.row,
              { borderColor: colors.borderLight },
              target.isCurrent && { backgroundColor: colors.primarySurface },
            ]}
            activeOpacity={0.65}
            onPress={() => handleSelect(target.isCurrent ? null : target.title)}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: target.isCurrent ? colors.primary : colors.borderLight },
              ]}
            />
            <Text
              style={[styles.rowTitle, { color: target.isCurrent ? colors.primary : colors.text }]}
            >
              {target.title}
            </Text>
            {target.isCurrent && (
              <Text style={[styles.currentTag, { color: colors.primary }]}>当前位置</Text>
            )}
            {!target.isCurrent && (
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        ))}

        {/* 恢复默认分组选项（仅当已被移动过时显示） */}
        {!targets.find((t) => t.title === defaultGroupTitle && t.isCurrent) && (
          <TouchableOpacity
            style={[styles.row, styles.restoreRow, { borderColor: colors.borderLight }]}
            activeOpacity={0.65}
            onPress={() => handleSelect(null)}
          >
            <Ionicons
              name="refresh-outline"
              size={16}
              color={colors.textMuted}
              style={styles.restoreIcon}
            />
            <Text style={[styles.rowTitle, { color: colors.textSecondary }]}>
              恢复默认（{defaultGroupTitle}）
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </BottomSheet>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  hint: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rowTitle: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  currentTag: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  restoreRow: {
    marginTop: Spacing.xs,
  },
  restoreIcon: {
    marginRight: -2,
  },
});
