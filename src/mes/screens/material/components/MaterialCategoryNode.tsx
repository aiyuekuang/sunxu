import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { MaterialCategoryTreeNode } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { Badge, ConfigBadge } from '../../../../core/components/Badge.tsx';
import { MATERIAL_BASE_TYPE_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface MaterialCategoryNodeProps {
  item: MaterialCategoryTreeNode;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  onPress?: () => void;
  onToggle: () => void;
}

export const MaterialCategoryNode = React.memo(function MaterialCategoryNode({
  item,
  depth,
  hasChildren,
  isExpanded,
  onPress,
  onToggle,
}: MaterialCategoryNodeProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, marginLeft: depth * 20 }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
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
            {item.name}
          </Text>
          <View style={styles.badges}>
            <ConfigBadge value={item.baseType} config={MATERIAL_BASE_TYPE_CONFIG} size="sm" />
            {item.isSystem ? <Badge label="系统根" variant="info" size="sm" /> : null}
            {!item.isActive ? <Badge label="停用" variant="default" size="sm" /> : null}
          </View>
        </View>
        <Text style={[styles.code, { color: colors.textSecondary }]}>{item.code}</Text>
      </View>
    </TouchableOpacity>
  );
});

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
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
    flexShrink: 0,
  },
  name: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  code: { fontSize: FontSize.xs, marginTop: 2 },
});
