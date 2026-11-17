import { Switch as NativeSwitch } from '@tarojs/components';
import type { SwitchProps as NativeSwitchProps } from '@tarojs/components';
import { useTaroTheme } from './Provider';

/**
 * Shared native on/off control. Keeps WeChat's accessible switch semantics and
 * event behavior while centralizing the checked color and control layout.
 */
export type SwitchProps = Omit<NativeSwitchProps, 'className' | 'color' | 'onChange' | 'ariaLabel'> & {
  className?: string;
  ariaLabel: string;
  onChange?: (checked: boolean) => void;
};

export function Switch({ className = '', onChange, ...props }: SwitchProps) {
  const theme = useTaroTheme();
  return (
    <NativeSwitch
      {...props}
      className={`ui-switch${className ? ` ${className}` : ''}`}
      color={theme.primaryColor}
      onChange={(event) => onChange?.(Boolean(event.detail.value))}
    />
  );
}
