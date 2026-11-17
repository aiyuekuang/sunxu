import type { PickerRegionProps } from '@tarojs/components';
import { Picker } from '@tarojs/components';
import type { ReactNode } from 'react';

type RegionPickerProps = Omit<PickerRegionProps, 'mode' | 'children'> & {
  children: ReactNode;
};

/** Shared wrapper for the platform's province/city/district picker. */
export function RegionPicker({ children, ...props }: RegionPickerProps) {
  return <Picker {...props} mode="region">{children}</Picker>;
}
