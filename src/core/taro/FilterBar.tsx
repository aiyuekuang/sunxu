import type { ReactNode } from 'react';
import { View } from '@tarojs/components';

/** Shared owner for the light, borderless quick-filter row used above lists. */
export function FilterBar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`ui-filter-bar${className ? ` ${className}` : ''}`}>{children}</View>;
}
