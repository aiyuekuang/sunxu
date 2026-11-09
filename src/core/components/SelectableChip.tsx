import type React from 'react';
import { type StyleProp, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { FontSize, Radius, Spacing } from '../theme/tokens';
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
  /** 可选尾随信息，如筛选数量。 */
  suffix?: React.ReactNode;
  /** sm=列表/弹层内的紧凑筛选胶囊；md=表单/设置卡内的常规选择胶囊 */
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
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
  suffix,
  size = 'sm',
  style,
}: SelectableChipProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        size === 'sm' ? styles.chipSm : styles.chipMd,
        {
          backgroundColor: selected ? `${colors.primary}14` : colors.surfaceSecondary,
          borderColor: selected ? `${colors.primary}2E` : colors.borderLight,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      activeOpacity={0.72}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <View style={styles.content}>
        <Text
          style={[styles.chipText, { color: selected ? colors.primary : colors.textSecondary }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {suffix}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
