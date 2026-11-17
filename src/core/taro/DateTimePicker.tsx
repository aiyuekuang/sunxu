import type { PickerDateProps, PickerTimeProps } from '@tarojs/components';
import { Picker, Text, View } from '@tarojs/components';
import { Icon } from './Icon';
import type { SelectVariant } from './Select';

type TriggerProps = {
  displayValue: string;
  placeholder?: string;
  variant?: SelectVariant;
  className?: string;
  ariaLabel?: string;
};

type DatePickerProps = Omit<PickerDateProps, 'mode'> & TriggerProps & { mode: 'date' };
type TimePickerProps = Omit<PickerTimeProps, 'mode'> & TriggerProps & { mode: 'time' };

function PickerTrigger({ displayValue, placeholder, variant = 'field', className = '', ariaLabel }: TriggerProps) {
  const iconName = variant === 'field' ? 'chevron-forward' : 'chevron-down';
  return (
    <View
      className={`ui-native-picker-trigger ui-native-picker-trigger--${variant}${className ? ` ${className}` : ''}`}
      ariaLabel={ariaLabel || displayValue || placeholder || '选择日期或时间'}
    >
      <Text className={`ui-native-picker-trigger__value${displayValue ? '' : ' is-placeholder'}`}>
        {displayValue || placeholder || '请选择'}
      </Text>
      <Icon name={iconName} className="ui-native-picker-trigger__icon" size="28rpx" />
    </View>
  );
}

export function DateTimePicker(props: DatePickerProps | TimePickerProps) {
  const { displayValue, placeholder, variant, className, ariaLabel, ...pickerProps } = props;
  const resolvedVariant = variant || 'field';
  return (
    <Picker {...pickerProps} className={`ui-native-picker ui-native-picker--${resolvedVariant}${className ? ` ${className}` : ''}`}>
      <PickerTrigger
        displayValue={displayValue}
        placeholder={placeholder}
        variant={resolvedVariant}
        ariaLabel={ariaLabel}
      />
    </Picker>
  );
}
