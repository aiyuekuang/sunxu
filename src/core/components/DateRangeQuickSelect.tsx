import dayjs, { type Dayjs } from 'dayjs';
import { Pressable, StyleSheet, View } from 'react-native';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText';

export type DateRangeValue = [startDate: string, endDate: string];

const PRESETS = [
  { key: 'today', label: '今天', getRange: () => range(dayjs(), dayjs()) },
  {
    key: 'yesterday',
    label: '昨天',
    getRange: () => {
      const yesterday = dayjs().subtract(1, 'day');
      return range(yesterday, yesterday);
    },
  },
  {
    key: 'this-week',
    label: '本周',
    getRange: () => {
      const start = mondayOf(dayjs());
      return range(start, start.add(6, 'day'));
    },
  },
  {
    key: 'last-week',
    label: '上周',
    getRange: () => {
      const start = mondayOf(dayjs().subtract(7, 'day'));
      return range(start, start.add(6, 'day'));
    },
  },
  {
    key: 'last-7-days',
    label: '近7天',
    getRange: () => range(dayjs().subtract(6, 'day'), dayjs()),
  },
  {
    key: 'last-30-days',
    label: '近30天',
    getRange: () => range(dayjs().subtract(29, 'day'), dayjs()),
  },
  {
    key: 'this-month',
    label: '本月',
    getRange: () => range(dayjs().startOf('month'), dayjs().endOf('month')),
  },
  {
    key: 'last-month',
    label: '上月',
    getRange: () => {
      const start = dayjs().subtract(1, 'month').startOf('month');
      return range(start, start.endOf('month'));
    },
  },
  {
    key: 'this-year',
    label: '本年度',
    getRange: () => range(dayjs().startOf('year'), dayjs()),
  },
] as const;

interface DateRangeQuickSelectProps {
  onSelect: (value: DateRangeValue) => void;
  /** 当前区间，用于高亮命中的快捷选项 */
  value?: [string | undefined, string | undefined];
  disabled?: boolean;
}

/** Apply a common date period to a start/end date pair. */
export function DateRangeQuickSelect({ onSelect, value, disabled = false }: DateRangeQuickSelectProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container} accessibilityLabel="日期范围快捷选择">
      {PRESETS.map((preset) => {
        const [start, end] = preset.getRange();
        const isSelected = Boolean(value && value[0] === start && value[1] === end);
        return (
          <Pressable
            key={preset.key}
            accessibilityRole="button"
            accessibilityLabel={`选择${preset.label}`}
            accessibilityState={{ selected: isSelected, disabled }}
            disabled={disabled}
            onPress={() => onSelect([start, end])}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                borderColor: isSelected ? colors.primary : colors.border,
                opacity: disabled ? 0.5 : pressed ? 0.72 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.optionText,
                { color: disabled ? colors.textTertiary : isSelected ? colors.textOnPrimary : colors.textSecondary },
              ]}
            >
              {preset.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function range(start: Dayjs, end: Dayjs): DateRangeValue {
  return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')];
}

function mondayOf(date: Dayjs): Dayjs {
  const offset = (date.day() + 6) % 7;
  return date.subtract(offset, 'day').startOf('day');
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  option: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: FontSize.xs,
  },
});
