import { Input as NativeInput } from '@tarojs/components';
import type { InputProps as NativeInputProps } from '@tarojs/components';

/**
 * Single-line input wrapper that preserves Taro's native keyboard, focus,
 * confirmation, and accessibility props. Shared geometry lives in .ui-input;
 * pages may add a layout class through className.
 */
export type InputProps = Omit<NativeInputProps, 'className'> & {
  className?: string;
  density?: 'regular' | 'compact';
  appearance?: 'standard' | 'embedded' | 'pill';
};

export function Input({ className = '', density = 'regular', appearance = 'standard', ...props }: InputProps) {
  const variantClasses = [
    density === 'compact' ? 'ui-input--compact' : '',
    appearance === 'embedded' ? 'ui-input--embedded' : '',
    appearance === 'pill' ? 'ui-input--pill' : ''
  ].filter(Boolean).join(' ');
  return <NativeInput {...props} className={`ui-input ${variantClasses}${className ? ` ${className}` : ''}`} />;
}
