import type { ReactNode } from 'react';
import { View } from '@tarojs/components';

/** Presentational tile; the host supplies its icon and semantic theme. */
export function IconTile({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`ui-icon-tile${className ? ` ${className}` : ''}`}>{children}</View>;
}
