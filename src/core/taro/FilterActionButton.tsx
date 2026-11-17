import { Text } from '@tarojs/components';
import { Button } from './Button';
import type { ButtonProps } from './Button';
import { Icon } from './Icon';

type FilterActionButtonProps = Omit<ButtonProps, 'children' | 'uiSize' | 'shape' | 'screenReaderLabel'> & {
  label: string;
  ariaLabel: string;
  active?: boolean;
  count?: number;
  indicator?: 'filter' | 'dropdown';
};

/** A secondary action that opens the owning page's advanced-filter panel. */
export function FilterActionButton({ label, ariaLabel, active = false, count = 0, indicator = 'filter', className = '', ...props }: FilterActionButtonProps) {
  const isActive = active || count > 0;
  return (
    <Button
      {...props}
      ariaLabel={ariaLabel}
      className={`ui-filter-action${isActive ? ' is-active' : ''}${className ? ` ${className}` : ''}`}
      uiSize="regular"
      appearance="plain"
    >
      <Icon name={indicator === 'dropdown' ? 'chevron-down' : 'filter'} className="ui-filter-action__icon" size={indicator === 'dropdown' ? 'var(--sz-icon-small)' : 'var(--sz-icon-filter)'} />
      <Text>{label}</Text>
      {count > 0 ? <Text className="ui-filter-action__count">{count}</Text> : null}
    </Button>
  );
}
