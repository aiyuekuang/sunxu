import { Text } from '@tarojs/components';
import type { CSSProperties, ReactNode } from 'react';

export type BadgeTone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted' | 'info';
export type BadgeSize = 'sm' | 'md';

export function Badge({
  children,
  label,
  className = '',
  tone = 'default',
  size = 'md',
  appearance = 'pill',
  color,
  bg,
  ariaLabel
}: {
  children?: ReactNode;
  label?: string;
  className?: string;
  tone?: BadgeTone;
  size?: BadgeSize;
  appearance?: 'pill' | 'text';
  color?: string;
  bg?: string;
  ariaLabel?: string;
}) {
  const content = children ?? label ?? '';
  const style: CSSProperties = {
    ...(color ? { color } : {}),
    ...(bg ? { backgroundColor: bg } : {})
  };

  return (
    <Text
      className={`app-badge app-badge--${tone} app-badge--${size} app-badge--${appearance}${className ? ` ${className}` : ''}`}
      style={style}
      aria-label={ariaLabel || label}
    >
      {content}
    </Text>
  );
}
