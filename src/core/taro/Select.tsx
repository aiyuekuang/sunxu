import { useState } from 'react';
import { Text, View } from '@tarojs/components';
import type { PickerSelectorProps } from '@tarojs/components';
import { Button } from './Button';
import { Icon } from './Icon';
import { OptionSheet } from './OptionSheet';

export type SelectRangeItem = string | number | Record<string, unknown>;
export type SelectVariant = 'field' | 'filter' | 'inline';
type SelectEvent = Parameters<NonNullable<PickerSelectorProps['onChange']>>[0];

/** Selector control with the shared searchable bottom-sheet option list. */
export function Select({
  range,
  rangeKey = 'label',
  value = 0,
  onChange,
  title = '请选择',
  placeholder = '请选择',
  triggerLabel,
  variant = 'field',
  indicatorPosition = 'end',
  className = '',
  disabled = false,
  searchable = false,
  searchPlaceholder = '搜索选项',
  ariaLabel
}: {
  range: readonly SelectRangeItem[];
  rangeKey?: string;
  value?: number;
  onChange: NonNullable<PickerSelectorProps['onChange']>;
  title?: string;
  placeholder?: string;
  triggerLabel?: string;
  variant?: SelectVariant;
  /** Leading disclosure keeps a compact label and indicator together in a toolbar. */
  indicatorPosition?: 'start' | 'end';
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedIndex = Number.isFinite(value) ? value : 0;
  const labelOf = (item: SelectRangeItem) => {
    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      return String(record[rangeKey] ?? record.label ?? record.name ?? '');
    }
    return String(item ?? '');
  };
  const selectedLabel = range[selectedIndex] === undefined ? '' : labelOf(range[selectedIndex]);
  const optionLabels = range.map(labelOf);
  const resolvedLabel = triggerLabel || selectedLabel || placeholder;
  const iconName = variant === 'field' ? 'chevron-forward' : 'chevron-down';

  function close() {
    setOpen(false);
  }

  function choose(index: number) {
    onChange({ detail: { value: index } } as SelectEvent);
    close();
  }

  return (
    <View className={`ui-select ui-select--${variant}${indicatorPosition === 'start' ? ' ui-select--leading-indicator' : ''}${className ? ` ${className}` : ''}`}>
      <Button
        className="ui-select__trigger"
        ariaLabel={ariaLabel || `${title}，当前${resolvedLabel}`}
        aria-expanded={open}
        disabled={disabled || range.length === 0}
        onClick={() => setOpen(true)}
        appearance="plain"
        uiSize={variant === 'field' ? 'row' : 'regular'}
      >
        <Text className={`ui-select__value${selectedLabel || triggerLabel ? '' : ' is-placeholder'}`}>{resolvedLabel}</Text>
        <Icon name={iconName} className="ui-select__chevron" size="var(--sz-icon-small)" />
      </Button>

      <OptionSheet
        open={open}
        title={title}
        options={optionLabels}
        selectedIndex={selectedIndex}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        emptyText={range.length ? '没有匹配选项' : '暂无可选项'}
        onClose={close}
        onChoose={choose}
      />
    </View>
  );
}
