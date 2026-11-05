import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScheduleActionSheetProps {
  visible: boolean;
  onClose: () => void;
  /** 弹层完成退出动画后触发，用于安全切换到下一个弹层 */
  onDismiss?: () => void;
  onPlanSchedule?: () => void;
  onWorkOrderSchedule?: () => void;
  onManualEntry?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScheduleActionSheet({
  visible,
  onClose,
  onDismiss,
  onPlanSchedule,
  onWorkOrderSchedule,
  onManualEntry,
}: ScheduleActionSheetProps) {
  const { colors } = useTheme();

  const allActions = [
    onPlanSchedule && {
      key: 'plan',
      icon: 'calendar-outline' as const,
      iconColor: colors.primary,
      title: '从计划排产',
      desc: '选择生产计划，自动创建工单并排产',
      onPress: onPlanSchedule,
    },
    onWorkOrderSchedule && {
      key: 'workOrder',
      icon: 'git-branch-outline' as const,
      iconColor: colors.warning,
      title: '按工单排产',
      desc: '选择已下达工单，算法自动安排时间',
      onPress: onWorkOrderSchedule,
    },
    onManualEntry && {
      key: 'manual',
      icon: 'create-outline' as const,
      iconColor: colors.success,
      title: '手工排产',
      desc: '手动选择工单、工作中心和时间',
      onPress: onManualEntry,
    },
  ];
  const actions = allActions.filter((a): a is NonNullable<typeof a> => !!a);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      onDismiss={onDismiss}
      title="新建排产"
      maxHeightRatio={0.45}
      dynamicHeight
    >
      <View style={styles.list}>
        {actions.map((action) => (
          <Pressable
            key={action.key}
            style={({ pressed }) => [
              styles.item,
              {
                backgroundColor: pressed ? `${colors.primary}08` : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={action.onPress}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${action.iconColor}15` }]}>
              <Ionicons name={action.icon} size={20} color={action.iconColor} />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.title, { color: colors.text }]}>{action.title}</Text>
              <Text style={[styles.desc, { color: colors.textMuted }]}>{action.desc}</Text>
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
    borderRadius: Radius['2xl'],
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
