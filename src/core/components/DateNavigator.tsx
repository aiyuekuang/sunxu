import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';
import { DatePickerField } from './DatePickerField';
import { FontSize, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { getDatePeriodRange, shiftDatePeriod, type DatePeriod } from '../utils/date';

export interface DateNavigatorProps {
  value: string;
  todayValue: string;
  onChange: (date: string) => void;
  label?: string;
  /** Period used by previous/next controls and the date label. Defaults to one day. */
  period?: DatePeriod;
  /** Optional upper bound for date selection and forward navigation. */
  maximumDate?: string;
}

const ACTION_TARGET =
  Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;
const SIDE_WIDTH = ACTION_TARGET * 2;

/** Browse dates or reporting periods and open the native date picker. */
export function DateNavigator({
  value,
  todayValue,
  onChange,
  label = '日期',
  period = 'day',
  maximumDate,
}: DateNavigatorProps) {
  const { colors } = useTheme();
  const selectedDate = dayjs(value);
  const isToday = selectedDate.isValid() && selectedDate.format('YYYY-MM-DD') === todayValue;
  const [rangeStart, rangeEnd] = getDatePeriodRange(value, period, maximumDate);
  const periodStart = dayjs(rangeStart);
  const periodEnd = dayjs(rangeEnd);
  const displayValue = !selectedDate.isValid()
    ? value
    : period === 'day'
      ? isToday
        ? '今天'
        : selectedDate.format('M月D日')
      : period === 'week'
        ? `${periodStart.format('M月D日')}—${periodEnd.format('M月D日')}`
        : period === 'month'
          ? periodStart.format('YYYY年M月')
          : periodStart.format('YYYY年');
  const previousLabel = period === 'day' ? '前一天' : '上一周期';
  const nextLabel = period === 'day' ? '后一天' : '下一周期';
  const maximum = maximumDate ? dayjs(maximumDate) : null;
  const nextDate = dayjs(shiftDatePeriod(value, period, 1));
  const isNextDisabled = Boolean(
    maximum?.isValid() && nextDate.isAfter(maximum, 'day'),
  );

  const stepDate = (amount: number) => {
    if (!selectedDate.isValid()) return;
    const direction = amount < 0 ? -1 : 1;
    const nextValue = shiftDatePeriod(value, period, direction);
    if (direction > 0 && maximum?.isValid() && dayjs(nextValue).isAfter(maximum, 'day')) return;
    onChange(nextValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        <View style={styles.sideSpacer} />
        <Pressable
          style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
          onPress={() => stepDate(-1)}
          accessibilityRole="button"
          accessibilityLabel={previousLabel}
          accessibilityHint={period === 'day' ? `查看前一天的${label}` : `查看${label}的上一周期`}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <DatePickerField
        label={label}
        hideLabel
        value={value}
        displayValue={displayValue}
        showCurrentShortcut={false}
        onChange={onChange}
        mode="date"
        clearable={false}
        maximumDate={maximumDate}
        compact
        centered
        containerStyle={styles.datePicker}
        accessibilityLabel={`选择${label}`}
      />

      <View style={styles.side}>
        <Pressable
          style={({ pressed }) => [
            styles.arrowButton,
            pressed && styles.pressed,
            isNextDisabled && styles.disabled,
          ]}
          onPress={() => stepDate(1)}
          accessibilityRole="button"
          accessibilityLabel={nextLabel}
          accessibilityHint={period === 'day' ? `查看后一天的${label}` : `查看${label}的下一周期`}
          accessibilityState={{ disabled: isNextDisabled }}
          disabled={isNextDisabled}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isNextDisabled ? colors.textTertiary : colors.textSecondary}
          />
        </Pressable>
        {isToday ? (
          <View style={styles.sideSpacer} />
        ) : (
          <Pressable
            style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}
            onPress={() => onChange(todayValue)}
            accessibilityRole="button"
            accessibilityLabel="返回今天"
          >
            <Text style={[styles.todayText, { color: colors.primary }]}>今天</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ACTION_TARGET,
  },
  side: {
    width: SIDE_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideSpacer: {
    width: ACTION_TARGET,
    height: ACTION_TARGET,
  },
  arrowButton: {
    width: ACTION_TARGET,
    height: ACTION_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePicker: {
    flex: 1,
    minWidth: 0,
  },
  todayButton: {
    width: ACTION_TARGET,
    height: ACTION_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.65,
  },
  disabled: {
    opacity: 0.55,
  },
});
