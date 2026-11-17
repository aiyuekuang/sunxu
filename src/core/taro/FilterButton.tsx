import { Button } from './Button';
import type { ButtonProps } from './Button';

type FilterButtonProps = Omit<ButtonProps, 'children' | 'uiSize' | 'shape' | 'screenReaderLabel'> & {
  label: string;
  ariaLabel: string;
};

import { FilterTriggerContent } from './FilterTriggerContent';

export function FilterButton({ label, ariaLabel, className = '', ...props }: FilterButtonProps) {
  return (
    <Button
      {...props}
      ariaLabel={ariaLabel}
      className={`ui-filter-button${className ? ` ${className}` : ''}`}
      uiSize="filter"
      shape="rounded"
    >
      <FilterTriggerContent label={label} />
    </Button>
  );
}
