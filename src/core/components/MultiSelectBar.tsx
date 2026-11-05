import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from './AppText';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

interface Action {
  label: string;
  icon: string;
  color?: string;
  onPress: () => void;
}

interface MultiSelectBarProps {
  selectedCount: number;
  total: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCancel: () => void;
  actions: Action[];
}

export function MultiSelectBar({
  selectedCount,
  total,
  onSelectAll,
  onDeselectAll,
  onCancel,
  actions,
}: MultiSelectBarProps) {
  const { colors } = useTheme();

  if (selectedCount === 0) return null;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
    >
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPress={selectedCount === total ? onDeselectAll : onSelectAll}
          style={styles.selectAllBtn}
        >
          <Ionicons
            name={selectedCount === total ? 'checkbox' : 'square-outline'}
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.countText, { color: colors.text }]}>已选 {selectedCount} 项</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={[styles.actionBtn, { backgroundColor: action.color ?? colors.primary }]}
            onPress={action.onPress}
          >
            <Ionicons
              name={action.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={colors.textOnPrimary}
            />
            <Text style={[styles.actionText, { color: colors.textOnPrimary }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>取消</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  countText: { fontSize: FontSize.base, fontWeight: '500' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  actionText: { fontSize: FontSize.sm, fontWeight: '600' },
  cancelBtn: { paddingHorizontal: Spacing.sm },
  cancelText: { fontSize: FontSize.sm },
});
