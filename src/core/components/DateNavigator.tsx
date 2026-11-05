import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';
import { DatePickerField } from './DatePickerField';
import { FontSize, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface DateNavigatorProps {
  value: string;
  todayValue: string;
  onChange: (date: string) => void;
  label?: string;
}

const ACTION_TARGET =
  Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;
const SIDE_WIDTH = ACTION_TARGET * 2;

/** Browse one day at a time or open the native date picker. */
export function DateNavigator({ value, todayValue, onChange, label = '日期' }: DateNavigatorProps) {
  const { colors } = useTheme();
  const selectedDate = dayjs(value);
  const isToday = value === todayValue;
  const displayValue = isToday
    ? '今天'
    : selectedDate.isValid()
      ? selectedDate.format('M月D日')
      : value;

  const stepDate = (amount: number) => {
    if (!selectedDate.isValid()) return;
    onChange(selectedDate.add(amount, 'day').format('YYYY-MM-DD'));
  };

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        <View style={styles.sideSpacer} />
        <Pressable
          style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
          onPress={() => stepDate(-1)}
          accessibilityRole="button"
          accessibilityLabel="前一天"
          accessibilityHint={`查看前一天的${label}`}
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
        compact
        centered
        containerStyle={styles.datePicker}
        accessibilityLabel={`选择${label}`}
      />

      <View style={styles.side}>
        <Pressable
          style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
          onPress={() => stepDate(1)}
          accessibilityRole="button"
          accessibilityLabel="后一天"
          accessibilityHint={`查看后一天的${label}`}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
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
});
