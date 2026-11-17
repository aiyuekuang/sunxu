import { useIconRenderer, type IconProps } from './Provider';

export type { IconName, IconProps } from './Provider';

/** Decorative icon only; the owning interactive control supplies its name. */
export function Icon(props: IconProps) {
  return useIconRenderer()(props);
}
