import { useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { AppText as Text } from './AppText.tsx';
import { PickerField } from './PickerField.tsx';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { type FieldHelpContent, FormLabel } from './FormLabel.tsx';

/** 超过此数量的选项自动切换展示形态 */
const CHIP_THRESHOLD = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChipOption {
  /** 选项值 */
  value: string;
  /** 显示文本 */
  label: string;
  /** 自定义颜色（选中时用于边框和背景色，如评级 A=绿/B=蓝） */
  color?: string;
}

interface ChipSelectFieldBaseProps {
  /** 字段标签 */
  label?: string;
  /** 是否必填（标签后显示红色 *） */
  required?: boolean;
  /** 字段帮助说明 */
  help?: FieldHelpContent;
  /** 选项列表 */
  options: ChipOption[];
  /** 允许点击已选中项取消选择，默认 false */
  clearable?: boolean;
  /** 视觉层级；outline 用于筛选面板中的低装饰选项，默认 filled。 */
  appearance?: 'filled' | 'outline';
  /**
   * 选项超过阈值时的降级策略：
   * - 'picker'（默认）：降级为 PickerField 底部弹窗
   * - 'scroll'：横向滚动 Chip（适用于已在 BottomSheet/Modal 内的场景，避免弹窗套弹窗）
   */
  overflow?: 'picker' | 'scroll';
  /** 布局自定义 */
  style?: ViewStyle;
}

interface ChipSelectFieldSingleProps extends ChipSelectFieldBaseProps {
  /** 当前选中值 */
  value: string;
  /** 选中变化回调 */
  onChange: (value: string) => void;
  /** 多选模式，默认 false */
  multiple?: false;
}

interface ChipSelectFieldMultipleProps extends ChipSelectFieldBaseProps {
  /** 当前选中值数组 */
  value: string[];
  /** 选中变化回调 */
  onChange: (value: string[]) => void;
  /** 多选模式 */
  multiple: true;
}

export type ChipSelectFieldProps = ChipSelectFieldSingleProps | ChipSelectFieldMultipleProps;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * 智能选项选择器，根据选项数量自动切换展示形态：
 * - ≤ 10 个：平铺 Chip 标签（换行）
 * - > 10 个：默认降级为 PickerField 弹窗，或 overflow="scroll" 时横向滚动 Chip
 *
 * 调用方无需关心展示形态，传入 options 即可。
 * 支持自定义颜色（如评级 A/B/C/D）、可清除、多选模式。
 *
 * **何时用哪个组件**：
 * - 固定选项 → 本组件（自动判断展示形态）
 * - 关联实体（需搜索、分页） → EntityPickerField
 *
 * @example
 * // 单选（≤6 自动平铺）
 * <ChipSelectField
 *   label="处置类型"
 *   required
 *   options={[
 *     { value: 'rework', label: '返工' },
 *     { value: 'scrap', label: '报废' },
 *     { value: 'concession', label: '让步接收' },
 *   ]}
 *   value={form.type}
 *   onChange={(v) => setField('type', v)}
 * />
 *
 * @example
 * // 在 BottomSheet 内，选项可能 > 6，用横向滚动避免弹窗套弹窗
 * <ChipSelectField
 *   label="仓库"
 *   overflow="scroll"
 *   options={warehouses.map(w => ({ value: w.id, label: w.name }))}
 *   value={selectedId}
 *   onChange={setSelectedId}
 * />
 *
 * @example
 * // 带颜色 + 可清除
 * <ChipSelectField
 *   label="供应商评级"
 *   clearable
 *   options={[
 *     { value: 'A', label: 'A 级', color: '#00B578' },
 *     { value: 'B', label: 'B 级', color: '#1677FF' },
 *     { value: 'C', label: 'C 级', color: '#FF8F1F' },
 *     { value: 'D', label: 'D 级', color: '#FF3141' },
 *   ]}
 *   value={form.rating}
 *   onChange={(v) => setField('rating', v)}
 * />
 *
 * @example
 * // 多选
 * <ChipSelectField
 *   label="筛选状态"
 *   multiple
 *   options={STATUS_OPTIONS}
 *   value={selectedStatuses}
 *   onChange={setSelectedStatuses}
 * />
 */
export function ChipSelectField(props: ChipSelectFieldProps) {
  const {
    label,
    required,
    help,
    options,
    clearable = false,
    appearance = 'filled',
    overflow = 'picker',
    style,
  } = props;
  const { colors } = useTheme();
  const exceedsThreshold = options.length > CHIP_THRESHOLD;
  const usePicker = exceedsThreshold && overflow === 'picker' && !props.multiple;
  const useScroll = exceedsThreshold && (overflow === 'scroll' || props.multiple);

  const isSelected = useCallback(
    (optValue: string): boolean => {
      if (props.multiple) {
        return props.value.includes(optValue);
      }
      return props.value === optValue;
    },
    [props.multiple, props.value],
  );

  const handlePress = useCallback(
    (optValue: string) => {
      if (props.multiple) {
        const currentValues = props.value;
        if (currentValues.includes(optValue)) {
          props.onChange(currentValues.filter((v) => v !== optValue));
        } else {
          props.onChange([...currentValues, optValue]);
        }
      } else {
        if (props.value === optValue && clearable) {
          props.onChange('');
        } else {
          props.onChange(optValue);
        }
      }
    },
    [props.multiple, props.value, props.onChange, clearable],
  );

  // 超过阈值 + picker 模式 → PickerField 弹窗
  if (usePicker) {
    return (
      <PickerField
        label={label ?? ''}
        required={required}
        help={help}
        options={options.map((o) => ({ value: o.value, label: o.label }))}
        value={(props as ChipSelectFieldSingleProps).value}
        onChange={(props as ChipSelectFieldSingleProps).onChange}
        clearable={clearable}
        containerStyle={style}
      />
    );
  }

  // 渲染单个 Chip
  const renderChip = (opt: ChipOption) => {
    const selected = isSelected(opt.value);
    const chipColor = opt.color;

    // 有自定义颜色：选中时该颜色做背景+白色文字，未选中时透明背景+该颜色文字
    // 无自定义颜色：选中时 primary 背景+白色文字，未选中时 surfaceSecondary
    const chipBg = selected
      ? (chipColor ?? (appearance === 'outline' ? colors.primarySurface : colors.primary))
      : chipColor
        ? 'transparent'
        : appearance === 'outline'
          ? 'transparent'
          : colors.surfaceSecondary;

    const chipBorder = selected
      ? (chipColor ?? colors.primary)
      : (chipColor ?? (appearance === 'outline' ? colors.border : 'transparent'));

    const textColor = selected
      ? chipColor
        ? colors.textOnPrimary
        : appearance === 'outline'
          ? colors.primary
          : colors.textOnPrimary
      : (chipColor ?? colors.textSecondary);

    return (
      <TouchableOpacity
        key={opt.value}
        style={[
          styles.chip,
          {
            backgroundColor: chipBg,
            borderColor: chipBorder,
          },
        ]}
        onPress={() => handlePress(opt.value)}
        activeOpacity={0.7}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.chipText,
            {
              color: textColor,
              fontWeight: selected ? '600' : '400',
            },
          ]}
        >
          {opt.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label ? <FormLabel label={label} required={required} help={help} /> : null}
      {useScroll ? (
        // 超过阈值：横向滚动
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollRow}
        >
          {options.map(renderChip)}
        </ScrollView>
      ) : (
        // 阈值内：换行平铺
        <View style={styles.chipRow}>{options.map(renderChip)}</View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  scrollRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSize.sm,
  },
});
