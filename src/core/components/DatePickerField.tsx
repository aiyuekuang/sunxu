import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from './AppText.tsx';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { now, today } from '../utils/date';
import { type FieldHelpContent, FormLabel } from './FormLabel.tsx';

export interface DatePickerFieldProps {
  label: string;
  value?: string;
  /** 自定义显示文案；值仍使用 value 作为原生日期选择器的初始日期。 */
  displayValue?: string;
  onChange: (dateStr: string) => void;
  placeholder?: string;
  required?: boolean;
  help?: FieldHelpContent;
  error?: string;
  mode?: 'date' | 'datetime' | 'time';
  /** 显示与当前字段模式匹配的“今天/此刻”单步操作。 */
  showCurrentShortcut?: boolean;
  containerStyle?: ViewStyle;
  clearable?: boolean;
  /** 禁用选择 */
  disabled?: boolean;
  /** 禁用时展示给用户的原因，并作为无障碍提示 */
  disabledReason?: string;
  /** 可选择的最大日期或日期时间（YYYY-MM-DD / YYYY-MM-DDTHH:mm:ss） */
  maximumDate?: string;
  /** 可选择的最小日期或日期时间（YYYY-MM-DD / YYYY-MM-DDTHH:mm:ss） */
  minimumDate?: string;
  /** 紧凑模式：去掉左侧图标，减小高度和内边距，适用于筛选栏 */
  compact?: boolean;
  /** 居中模式：文字与箭头整体居中展示，适用于周期导航等窄控件 */
  centered?: boolean;
  /** 无障碍名称；未传时回退到字段 label。 */
  accessibilityLabel?: string;
  /** 父级已提供可见字段标题时隐藏重复标签；无障碍名称仍由 accessibilityLabel 或 label 提供。 */
  hideLabel?: boolean;
}

export function DatePickerField({
  label,
  value,
  displayValue,
  onChange,
  placeholder,
  required,
  help,
  error,
  mode = 'date',
  showCurrentShortcut,
  containerStyle,
  clearable = true,
  disabled,
  disabledReason,
  maximumDate,
  minimumDate,
  compact,
  centered,
  accessibilityLabel,
  hideLabel = false,
}: DatePickerFieldProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const resolvedShowCurrentShortcut = showCurrentShortcut ?? mode === 'date';
  const showStandaloneCurrentShortcut = !label && resolvedShowCurrentShortcut && !compact;
  const [show, setShow] = useState(false);
  // Android datetime needs two steps: date first, then time
  const [androidStep, setAndroidStep] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const parsedDate = (() => {
    if (!value) return undefined;
    if (mode === 'time') {
      // value is "HH:mm", parse into a Date for the picker
      const [h, m] = value.split(':').map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return undefined;
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    }
    return dayjs(value).toDate();
  })();
  const isValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());
  const parsedMaximumDate = maximumDate ? dayjs(maximumDate).toDate() : undefined;
  const isValidMaximumDate = parsedMaximumDate && !Number.isNaN(parsedMaximumDate.getTime());
  const parsedMinimumDate = minimumDate ? dayjs(minimumDate).toDate() : undefined;
  const isValidMinimumDate = parsedMinimumDate && !Number.isNaN(parsedMinimumDate.getTime());

  const getCurrentValue = () => {
    if (mode === 'date') return today();
    const currentDateTime = now();
    return mode === 'time' ? dayjs(currentDateTime).format('HH:mm') : currentDateTime;
  };

  const isCurrentValueWithinBounds = () => {
    const currentValue = getCurrentValue();
    const candidate = dayjs(mode === 'time' ? `${today()}T${currentValue}` : currentValue);
    const precision = mode === 'date' ? 'day' : 'minute';
    const minimum = minimumDate ? dayjs(minimumDate) : null;
    const maximum = maximumDate ? dayjs(maximumDate) : null;

    if (!candidate.isValid()) return false;
    if (minimum?.isValid() && candidate.isBefore(minimum, precision)) return false;
    if (maximum?.isValid() && candidate.isAfter(maximum, precision)) return false;
    return true;
  };

  const handleUseCurrent = () => {
    if (disabled || !isCurrentValueWithinBounds()) return;
    onChange(getCurrentValue());
  };

  const displayText = isValidDate
    ? mode === 'datetime'
      ? dayjs(parsedDate).format('YYYY-MM-DD HH:mm')
      : mode === 'time'
        ? dayjs(parsedDate).format('HH:mm')
        : dayjs(parsedDate).format('YYYY-MM-DD')
    : '';
  const visibleText = displayValue ?? displayText;
  const resolvedDisabledReason = disabled ? (disabledReason ?? '当前字段不可修改') : undefined;

  const handlePress = () => {
    if (disabled) return;
    setAndroidStep(mode === 'time' ? 'time' : 'date');
    setTempDate(null);
    setIOSDate(isValidDate ? parsedDate : new Date());
    setShow(true);
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'dismissed') {
        setTempDate(null);
        return;
      }
      if (selectedDate) {
        if (mode === 'datetime' && androidStep === 'date') {
          setTempDate(selectedDate);
          setAndroidStep('time');
          // Show time picker next tick
          setTimeout(() => setShow(true), 100);
          return;
        }
        const finalDate =
          mode === 'datetime' && tempDate ? mergeDateTime(tempDate, selectedDate) : selectedDate;
        emitValue(finalDate);
        setTempDate(null);
      }
    }
    // iOS handled by confirm button
  };

  const handleIOSConfirm = () => {
    setShow(false);
    if (iosDate) {
      emitValue(iosDate);
    }
  };

  const [iosDate, setIOSDate] = useState<Date>(parsedDate && isValidDate ? parsedDate : new Date());

  const handleIOSChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setIOSDate(selectedDate);
    }
  };

  const emitValue = (date: Date) => {
    if (mode === 'datetime') {
      onChange(dayjs(date).format('YYYY-MM-DD[T]HH:mm:ss'));
    } else if (mode === 'time') {
      onChange(dayjs(date).format('HH:mm'));
    } else {
      onChange(dayjs(date).format('YYYY-MM-DD'));
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {!hideLabel && (label || showStandaloneCurrentShortcut) ? (
        <FormLabel
          label={label}
          required={required}
          help={help}
          trailingAction={
            resolvedShowCurrentShortcut
              ? {
                  label: mode === 'date' ? '今天' : '此刻',
                  accessibilityLabel: `${label || '日期'}设为${mode === 'date' ? '今天' : '此刻'}`,
                  onPress: handleUseCurrent,
                  disabled: Boolean(disabled) || !isCurrentValueWithinBounds(),
                }
              : undefined
          }
        />
      ) : null}
      <TouchableOpacity
        style={[
          compact ? styles.inputWrapperCompact : styles.inputWrapper,
          centered && styles.inputWrapperCentered,
          {
            borderColor: error ? colors.error : disabled ? colors.border : 'transparent',
            backgroundColor: colors.surfaceSecondary,
            opacity: disabled ? 0.72 : 1,
          },
        ]}
        onPress={handlePress}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel ?? (label || undefined)}
        accessibilityState={{ disabled: Boolean(disabled) }}
        accessibilityHint={resolvedDisabledReason}
      >
        {!compact && (
          <Ionicons
            name={mode === 'date' ? 'calendar-outline' : 'time-outline'}
            size={18}
            color={displayText ? colors.text : colors.textTertiary}
          />
        )}
        <Text
          style={[
            compact ? styles.valueTextCompact : styles.valueText,
            centered && styles.valueTextCentered,
            { color: visibleText ? colors.text : colors.textTertiary },
          ]}
          numberOfLines={1}
        >
          {visibleText ||
            placeholder ||
            (mode === 'datetime'
              ? '请选择日期时间'
              : mode === 'time'
                ? '请选择时间'
                : '请选择日期')}
        </Text>
        {clearable && visibleText && !disabled ? (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons name="close-circle" size={compact ? 16 : 18} color={colors.textTertiary} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-down" size={compact ? 14 : 16} color={colors.textTertiary} />
        )}
      </TouchableOpacity>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
      {resolvedDisabledReason ? (
        <Text style={[styles.disabledHint, { color: colors.warning }]}>
          {resolvedDisabledReason}
        </Text>
      ) : null}

      {/* Android: inline picker */}
      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={tempDate || (isValidDate ? parsedDate : new Date())}
          mode={mode === 'datetime' ? androidStep : mode === 'time' ? 'time' : 'date'}
          display="default"
          onChange={handleChange}
          maximumDate={isValidMaximumDate ? parsedMaximumDate : undefined}
          minimumDate={isValidMinimumDate ? parsedMinimumDate : undefined}
        />
      )}

      {/* iOS: modal picker */}
      {Platform.OS === 'ios' && (
        <Modal visible={show} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setShow(false)}>
            <Pressable
              style={[
                styles.modalContent,
                { backgroundColor: colors.surface, paddingBottom: insets.bottom || 16 },
              ]}
            >
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={[styles.modalBtn, { color: colors.textSecondary }]}>取消</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text style={[styles.modalBtn, { color: colors.primary }]}>确定</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={iosDate}
                mode={mode === 'time' ? 'time' : mode === 'datetime' ? 'datetime' : 'date'}
                display="spinner"
                onChange={handleIOSChange}
                maximumDate={isValidMaximumDate ? parsedMaximumDate : undefined}
                minimumDate={isValidMinimumDate ? parsedMinimumDate : undefined}
                themeVariant={isDark ? 'dark' : 'light'}
                style={styles.iosPicker}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

function mergeDateTime(datePart: Date, timePart: Date): Date {
  const merged = new Date(datePart);
  merged.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
  return merged;
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  inputWrapperCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    height: 44,
    gap: Spacing.xs,
  },
  valueText: {
    flex: 1,
    fontSize: FontSize.base,
  },
  valueTextCompact: {
    flex: 1,
    fontSize: FontSize.sm,
  },
  inputWrapperCentered: {
    justifyContent: 'center',
  },
  valueTextCentered: {
    flex: 0,
    flexShrink: 1,
    textAlign: 'center',
  },
  error: {
    fontSize: FontSize.xs,
  },
  disabledHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    // paddingBottom is set dynamically via insets.bottom
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  modalBtn: {
    fontSize: FontSize.base,
  },
  iosPicker: {
    height: 216,
  },
});
