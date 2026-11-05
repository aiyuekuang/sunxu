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
  disabled?: boolean;
}

/** Apply a common date period to a start/end date pair. */
export function DateRangeQuickSelect({ onSelect, disabled = false }: DateRangeQuickSelectProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container} accessibilityLabel="日期范围快捷选择">
      {PRESETS.map((preset) => (
        <Pressable
          key={preset.key}
          accessibilityRole="button"
          accessibilityLabel={`选择${preset.label}`}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => onSelect(preset.getRange())}
          style={({ pressed }) => [
            styles.option,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
              opacity: disabled ? 0.5 : pressed ? 0.72 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.optionText,
              { color: disabled ? colors.textTertiary : colors.textSecondary },
            ]}
          >
            {preset.label}
          </Text>
        </Pressable>
      ))}
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
