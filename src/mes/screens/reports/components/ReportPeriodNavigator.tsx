import { Ionicons } from '@expo/vector-icons';
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import {
  getReportPeriodUnitLabel,
  isCurrentReportPeriod,
  reportPeriodDisplayLabel,
  type ReportPeriodState,
  type ReportQuickRangeKey,
  shiftReportPeriod,
} from '../../../constants/report-quick-range';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate, today } from '../../../../core/utils/date';
import { ReportQuickRangeBar } from './ReportQuickRangeBar.tsx';

interface ReportPeriodNavigatorProps {
  period: ReportPeriodState;
  onChange: (period: ReportPeriodState) => void;
  customRange?: { startDate?: string; endDate?: string };
  style?: StyleProp<ViewStyle>;
}

export function ReportPeriodNavigator({
  period,
  onChange,
  customRange,
  style,
}: ReportPeriodNavigatorProps) {
  const { colors } = useTheme();
  const hasCustomRange = Boolean(customRange?.startDate && customRange?.endDate);
  const isCurrent = isCurrentReportPeriod(period);
  const unitLabel = getReportPeriodUnitLabel(period.key);
  const displayLabel = hasCustomRange
    ? `${formatDate(customRange?.startDate)} - ${formatDate(customRange?.endDate)}`
    : reportPeriodDisplayLabel(period);

  const handlePeriodTypeChange = (key: ReportQuickRangeKey) => {
    onChange({ key, anchorDate: customRange?.startDate ?? period.anchorDate });
  };

  const handleShift = (direction: -1 | 1) => {
    if (direction === 1 && (isCurrent || hasCustomRange)) return;
    onChange(shiftReportPeriod(period, direction));
  };

  const handleDateChange = (anchorDate: string) => {
    if (anchorDate) onChange({ ...period, anchorDate });
  };

  return (
    <View style={[styles.container, style]}>
      <ReportQuickRangeBar
        value={hasCustomRange ? null : period.key}
        onChange={handlePeriodTypeChange}
        style={styles.typeTabs}
      />
      <View style={styles.navigatorRow}>
        <Pressable
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
          onPress={() => handleShift(-1)}
          hitSlop={HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel={`前一${unitLabel}`}
        >
          <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
          <Text style={[styles.navText, { color: colors.textSecondary }]}>前一{unitLabel}</Text>
        </Pressable>
        <DatePickerField
          label=""
          value={customRange?.startDate ?? period.anchorDate}
          displayValue={displayLabel}
          onChange={handleDateChange}
          disabled={hasCustomRange}
          disabledReason="自定义日期范围请通过筛选入口修改"
          maximumDate={today()}
          clearable={false}
          compact
          centered
          accessibilityLabel={`选择${period.key === 'today' ? '日期' : unitLabel}，当前${displayLabel}`}
          containerStyle={styles.periodPicker}
        />
        <Pressable
          style={({ pressed }) => [
            styles.navButton,
            (isCurrent || hasCustomRange) && styles.disabledButton,
            pressed && !(isCurrent || hasCustomRange) && styles.pressed,
          ]}
          onPress={() => handleShift(1)}
          disabled={isCurrent || hasCustomRange}
          hitSlop={HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel={`后一${unitLabel}`}
          accessibilityState={{ disabled: isCurrent || hasCustomRange }}
        >
          <Text
            style={[
              styles.navText,
              { color: isCurrent || hasCustomRange ? colors.textTertiary : colors.textSecondary },
            ]}
          >
            后一{unitLabel}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isCurrent || hasCustomRange ? colors.textTertiary : colors.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 0, width: '100%' },
  typeTabs: { paddingHorizontal: 0, paddingVertical: 0 },
  navigatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    width: '100%',
    paddingTop: Spacing.sm,
  },
  navButton: {
    minHeight: MIN_TOUCH_TARGET,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  periodPicker: {
    flex: 1,
    minWidth: 0,
  },
  navText: { fontSize: FontSize.xs, fontWeight: '500' },
  disabledButton: { opacity: 0.72 },
  pressed: { opacity: 0.72 },
});
