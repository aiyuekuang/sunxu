import { Textarea as NativeTextarea } from '@tarojs/components';
import type { TextareaProps as NativeTextareaProps } from '@tarojs/components';

/**
 * Multiline input wrapper that preserves Taro's native auto-height, focus,
 * cursor, and confirmation props. Shared geometry lives in .ui-textarea;
 * pages may add a layout class through className.
 */
export type TextareaProps = Omit<NativeTextareaProps, 'className'> & {
  className?: string;
  variant?: 'compact' | 'regular' | 'long';
};

export function Textarea({ className = '', variant = 'regular', ...props }: TextareaProps) {
  const variantClass = variant === 'long' ? ' ui-textarea--long' : variant === 'compact' ? ' ui-textarea--compact' : '';
  return <NativeTextarea {...props} className={`ui-textarea${variantClass}${className ? ` ${className}` : ''}`} />;
}
