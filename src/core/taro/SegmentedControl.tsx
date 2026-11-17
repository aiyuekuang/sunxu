import { View } from '@tarojs/components';
import { Button } from './Button';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

/**
 * 分段切换（轨道 + 选中块）。轨道几何、选中配色和圆角由 the platform stylesheet 的 .ui-segmented 提供，
 * 页面只负责摆放位置；不保存选中值，选中态由调用页面的状态决定。
 */
export function SegmentedControl<T extends string>({
  className = '',
  variant = 'default',
  density,
  ariaLabel,
  options,
  value,
  onChange
}: {
  className?: string;
  variant?: 'default' | 'settings';
  density: 'regular' | 'compact';
  ariaLabel?: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className={`ui-segmented${density === 'compact' ? ' ui-segmented--compact' : ''}${variant === 'settings' ? ' ui-segmented--settings' : ''}${className ? ` ${className}` : ''}`}>
      {options.map((option) => (
        <Button
          className={`ui-segmented__option${option.value === value ? ' is-active' : ''}`}
          key={option.value}
          ariaLabel={ariaLabel ? `${ariaLabel}：${option.label}` : option.label}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          appearance="plain"
          uiSize="segmented"
        >
          {option.label}
        </Button>
      ))}
    </View>
  );
}
