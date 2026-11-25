import type React from 'react';
import {
  type AccessibilityRole,
  type Insets,
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  Platform,
  View,
  type ViewStyle,
} from 'react-native';
import { FontSize, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText';

export interface SelectableChipProps {
  label: string;
  /** 是否选中 */
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  /** 自定义读屏名称；默认使用可见标签。 */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** 选择项语义；列表单选组可声明 radio。 */
  accessibilityRole?: AccessibilityRole;
  /** Optional semantic color for a categorized option. */
  color?: string;
  appearance?: 'filled' | 'outline';
  /** 扩展透明触控区域，不改变胶囊的可见尺寸。 */
  hitSlop?: Insets;
  /** 可选尾随信息，如筛选数量。 */
  suffix?: React.ReactNode;
  /** sm=列表/弹层内的紧凑筛选胶囊；md=表单/设置卡内的常规选择胶囊 */
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * 通用的"可选中小胶囊"原语：筛选分组、展示模式等轻量单选/多选切换。
 *
 * 适用边界：
 * - 表单内的多选选项字段继续用 `ChipSelectField`（带 FormField 标签/帮助语义）；
 * - 实体筛选（打开实体选择弹窗的筛选项）继续用 `EntityFilterChip`；
 * - 状态/视图 Tab 切换用 `StatusTabs`；
 * - 本组件只负责单个可选中胶囊的视觉与交互，不承载业务规则。
 */
export function SelectableChip({
  label,
  selected,
  onPress,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  color,
  appearance = 'filled',
  hitSlop,
  suffix,
  size = 'sm',
  style,
  testID,
}: SelectableChipProps) {
  const { colors } = useTheme();
  const usesCheckedState = accessibilityRole === 'radio' || accessibilityRole === 'checkbox';
  const minimumTarget = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;
  const selectedBackgroundColor = color ?? (appearance === 'outline' ? colors.primarySurface : colors.primary);
  const selectedTextColor = color ? colors.textOnPrimary : appearance === 'outline' ? colors.primary : colors.textOnPrimary;
  const unselectedBackgroundColor = color ? 'transparent' : appearance === 'outline' ? 'transparent' : colors.surfaceSecondary;
  const unselectedBorderColor = color ?? (appearance === 'outline' ? colors.border : 'transparent');

  return (
    <TouchableOpacity
      style={[styles.target, { minHeight: minimumTarget, minWidth: minimumTarget }]}
      hitSlop={hitSlop}
      activeOpacity={0.72}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={usesCheckedState ? { checked: selected, disabled } : { selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      aria-checked={usesCheckedState ? selected : undefined}
      aria-selected={accessibilityRole === 'tab' ? selected : undefined}
      aria-pressed={accessibilityRole === 'button' ? selected : undefined}
      aria-disabled={disabled}
      testID={testID}
    >
      <View
        style={[
          styles.chip,
          size === 'sm' ? styles.chipSm : styles.chipMd,
          {
            backgroundColor: selected ? selectedBackgroundColor : unselectedBackgroundColor,
            borderColor: selected ? color ?? colors.primary : unselectedBorderColor,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        <View style={styles.content}>
          <Text
            style={[styles.chipText, { color: selected ? selectedTextColor : color ?? colors.textSecondary }]}
            numberOfLines={1}
          >
            {label}
          </Text>
          {suffix}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  target: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSm: {
    minHeight: 28,
    paddingHorizontal: 10,
  },
  chipMd: {
    minHeight: 36,
    paddingHorizontal: Spacing.md,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
