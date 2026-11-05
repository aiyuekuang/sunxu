import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface PurchaseOrderMoreActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  onReceiveRequested: () => void;
}

export function PurchaseOrderMoreActionsSheet({
  visible,
  onClose,
  onDismiss,
  onReceiveRequested,
}: PurchaseOrderMoreActionsSheetProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      onDismiss={onDismiss}
      title="更多操作"
      maxHeightRatio={0.42}
      dynamicHeight
    >
      <Pressable
        style={({ pressed }) => [
          styles.action,
          {
            backgroundColor: pressed ? `${colors.primary}08` : colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={() => {
          // 先记录待执行动作，再关闭当前菜单；真正打开收货弹层交给
          // onDismiss，避免两个 BottomSheet 在关闭动画期间同时 present。
          onReceiveRequested();
          onClose();
        }}
        accessibilityRole="button"
        accessibilityLabel="采购收货"
      >
        <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}14` }]}>
          <Ionicons name="clipboard-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: colors.text }]}>采购收货</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            按本次实际到货填写并提交
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  action: {
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
  description: {
    fontSize: FontSize.xs,
  },
});
