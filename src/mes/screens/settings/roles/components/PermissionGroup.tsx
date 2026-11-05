import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { PermissionNode } from '../../../../host/api-types';
import { AppText as Text } from '../../../../../core/components/AppText.tsx';
import { FontSize, Spacing } from '../../../../../core/theme/tokens';
import { useTheme } from '../../../../../core/theme/useTheme';

export interface PermissionGroupProps {
  node: PermissionNode;
  checked: Set<string>;
  onToggle: (id: string, allIds: string[]) => void;
  depth?: number;
  disabled?: boolean;
}

function collectLeafIds(nodes: PermissionNode[]): string[] {
  const ids: string[] = [];
  for (const n of nodes) {
    if (n.children?.length) {
      ids.push(...collectLeafIds(n.children));
    } else {
      ids.push(n.id);
    }
  }
  return ids;
}

export function PermissionGroup({
  node,
  checked,
  onToggle,
  depth = 0,
  disabled = false,
}: PermissionGroupProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const leafIds = hasChildren ? collectLeafIds(node.children ?? []) : [];

  let isChecked: boolean;
  let isIndeterminate: boolean;
  if (hasChildren) {
    const checkedCount = leafIds.filter((id) => checked.has(id)).length;
    isChecked = checkedCount === leafIds.length;
    isIndeterminate = checkedCount > 0 && !isChecked;
  } else {
    isChecked = checked.has(node.id);
    isIndeterminate = false;
  }

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.permRow,
          { paddingLeft: Spacing.md + depth * 16, borderTopColor: colors.borderLight },
        ]}
        onPress={() => (hasChildren ? setExpanded((v) => !v) : onToggle(node.id, []))}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={[
            styles.checkbox,
            {
              borderColor: isChecked
                ? colors.primary
                : isIndeterminate
                  ? colors.primary
                  : colors.border,
              backgroundColor: isChecked
                ? colors.primary
                : isIndeterminate
                  ? colors.primarySurface
                  : 'transparent',
              opacity: disabled ? 0.5 : 1,
            },
          ]}
          onPress={() => !disabled && onToggle(node.id, hasChildren ? leafIds : [])}
          hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
          disabled={disabled}
        >
          {isChecked && <Ionicons name="checkmark" size={11} color={colors.textOnPrimary} />}
          {isIndeterminate && (
            <View style={[styles.indeterminate, { backgroundColor: colors.primary }]} />
          )}
        </TouchableOpacity>

        <Text style={[styles.permLabel, { color: colors.text }]}>{node.name}</Text>
        {!!node.description && (
          <Text style={[styles.permDesc, { color: colors.textTertiary }]} numberOfLines={1}>
            {node.description}
          </Text>
        )}

        {hasChildren && (
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.textTertiary}
          />
        )}
      </TouchableOpacity>

      {expanded &&
        hasChildren &&
        node.children?.map((child) => (
          <PermissionGroup
            key={child.id}
            node={child}
            checked={checked}
            onToggle={onToggle}
            depth={depth + 1}
            disabled={disabled}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indeterminate: { width: 8, height: 2, borderRadius: 1 },
  permLabel: { flex: 1, fontSize: FontSize.base },
  permDesc: { fontSize: FontSize.sm, flexShrink: 1, maxWidth: 150 },
});
