import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkCenterNodeProps {
  /** Work center name */
  name: string;
  /** Work center code */
  code: string;
  /** Type label from dictionary */
  type?: string | null;
  /** Whether the work center is active */
  isActive: boolean;
  /** Tree depth level */
  depth: number;
  /** Whether this node has children */
  hasChildren: boolean;
  /** Whether the node is expanded */
  isExpanded: boolean;
  /** Navigate to detail */
  onPress: () => void;
  /** Toggle expand/collapse */
  onToggle: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const WorkCenterNode = React.memo(function WorkCenterNode({
  name,
  code,
  type,
  isActive,
  depth,
  hasChildren,
  isExpanded,
  onPress,
  onToggle,
}: WorkCenterNodeProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, marginLeft: depth * 20 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity style={styles.expandBtn} onPress={onToggle} disabled={!hasChildren}>
        {hasChildren ? (
          <Ionicons
            name={isExpanded ? 'chevron-down' : 'chevron-forward'}
            size={16}
            color={colors.textSecondary}
          />
        ) : (
          <View style={styles.expandPlaceholder} />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.right}>
            {type ? (
              <View style={[styles.typeBadge, { backgroundColor: colors.primarySurface }]}>
                <Text style={[styles.typeBadgeText, { color: colors.primary }]}>{type}</Text>
              </View>
            ) : null}
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isActive ? colors.success : colors.border },
              ]}
            />
          </View>
        </View>
        <Text style={[styles.code, { color: colors.textSecondary }]}>{code}</Text>
      </View>
    </TouchableOpacity>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.sm,
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    marginBottom: 6,
    ...Shadow.sm,
  },
  expandBtn: { width: 24, alignItems: 'center', justifyContent: 'center' },
  expandPlaceholder: { width: 16 },
  content: { flex: 1, marginLeft: Spacing.xs },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  code: { fontSize: FontSize.xs, marginTop: 2 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: Radius.full },
  typeBadgeText: { fontSize: FontSize.xs, fontWeight: '500' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
