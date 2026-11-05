import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkOrderMoreActionItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  color: string;
  onPress: () => void;
}

interface WorkOrderMoreActionsSheetProps {
  visible: boolean;
  actions: WorkOrderMoreActionItem[];
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkOrderMoreActionsSheet({
  visible,
  actions,
  onClose,
}: WorkOrderMoreActionsSheetProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="更多操作"
      maxHeightRatio={0.55}
      dynamicHeight
    >
      <View style={styles.list}>
        {actions.map((action) => (
          <Pressable
            key={action.key}
            style={({ pressed }) => [
              styles.item,
              {
                backgroundColor: pressed ? `${action.color}08` : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              onClose();
              action.onPress();
            }}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${action.color}14` }]}>
              <Ionicons name={action.icon} size={20} color={action.color} />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.title, { color: colors.text }]}>{action.label}</Text>
              {!!action.description && (
                <Text style={[styles.desc, { color: colors.textMuted }]}>{action.description}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  desc: {
    fontSize: FontSize.xs,
  },
});
