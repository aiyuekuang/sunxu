import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type ViewStyle, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

type StockOperationAction = 'in' | 'out' | 'transfer';

interface QuickAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  operation: StockOperationAction;
}

interface WarehouseQuickActionsProps {
  /** 是否允许发起其他入库。 */
  canOtherIn: boolean;
  /** 是否允许发起其他出库。 */
  canOtherOut: boolean;
  /** 是否允许发起仓库或仓位调拨。 */
  canTransfer: boolean;
  /** 选择作业后打开对应录入表单。 */
  onOperation: (action: StockOperationAction) => void;
  /** 容器布局样式。 */
  style?: ViewStyle;
}

interface QuickActionButtonProps {
  /** 面向业务人员的动作名称。 */
  label: string;
  /** 与动作语义对应的图标。 */
  icon: keyof typeof Ionicons.glyphMap;
  /** 点击后执行动作。 */
  onPress: () => void;
  /** 是否展示前置分隔线。 */
  showDivider: boolean;
}

function QuickActionButton({ label, icon, onPress, showDivider }: QuickActionButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.action,
        showDivider ? [styles.actionDivider, { borderLeftColor: colors.border }] : undefined,
        pressed ? [styles.actionPressed, { backgroundColor: colors.primarySurface }] : undefined,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={[styles.actionText, { color: colors.primary }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function WarehouseQuickActions({
  canOtherIn,
  canOtherOut,
  canTransfer,
  onOperation,
  style,
}: WarehouseQuickActionsProps) {
  const { colors } = useTheme();
  const actions: QuickAction[] = [
    ...(canOtherIn
      ? [
          {
            label: '其他入库',
            icon: 'arrow-down-circle-outline' as const,
            operation: 'in' as const,
          },
        ]
      : []),
    ...(canOtherOut
      ? [
          {
            label: '其他出库',
            icon: 'arrow-up-circle-outline' as const,
            operation: 'out' as const,
          },
        ]
      : []),
    ...(canTransfer
      ? [
          {
            label: '调拨',
            icon: 'swap-horizontal-outline' as const,
            operation: 'transfer' as const,
          },
        ]
      : []),
  ];

  if (actions.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      {actions.map((action, index) => (
        <QuickActionButton
          key={action.operation}
          label={action.label}
          icon={action.icon}
          onPress={() => onOperation(action.operation)}
          showDivider={index > 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
  },
  action: {
    minHeight: MIN_TOUCH_TARGET,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  actionDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  actionText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  actionPressed: {
    opacity: 0.8,
  },
});
