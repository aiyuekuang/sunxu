import { useState } from 'react';
import { View } from '@tarojs/components';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Input, type InputProps } from './Input';

export type SearchInputProps = Omit<InputProps, 'className' | 'appearance' | 'density' | 'value' | 'onInput' | 'ariaLabel'> & {
  /** Layout class for the shared search field root. */
  className?: string;
  /** Accessible name for the search field. */
  ariaLabel: string;
  /** Search field density; geometry is owned by the platform stylesheet and theme tokens. */
  density?: 'regular' | 'compact';
  value: string;
  onInput: NonNullable<InputProps['onInput']>;
  clearable?: boolean;
  /** Keep the source CRM search clear affordance visible before any text is entered. */
  clearWhenEmpty?: boolean;
  clearIconName?: IconName;
  onClear?: () => void;
  clearLabel?: string;
};

/**
 * Shared search field for list search and in-page candidate pickers.
 * It owns the search icon, field surface, focus state, and optional clear action;
 * query timing, request state, and result feedback stay with the caller.
 */
export function SearchInput({
  className = '',
  ariaLabel,
  density = 'regular',
  value,
  onInput,
  clearable = false,
  clearWhenEmpty = false,
  clearIconName = 'close',
  onClear,
  clearLabel = '清除搜索内容',
  onFocus,
  onBlur,
  disabled,
  ...inputProps
}: SearchInputProps) {
  const [focused, setFocused] = useState(false);
  const stateClass = `${focused ? ' is-focused' : ''}${value.length === 0 ? ' is-empty' : ''}${disabled ? ' is-disabled' : ''}`;

  return (
    <View className={`ui-search-input ui-search-input--${density}${stateClass}${className ? ` ${className}` : ''}`}>
      <Icon name="search" className="ui-search-input__icon" size="var(--sz-icon-search)" />
      <Input
        {...inputProps}
        ariaLabel={ariaLabel}
        appearance="embedded"
        density={density}
        className="ui-search-input__control"
        disabled={disabled}
        value={value}
        onInput={onInput}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
      />
      {clearable && (value || clearWhenEmpty) && onClear && !disabled ? (
        <Button
          className="ui-search-input__clear"
          ariaLabel={clearLabel}
          screenReaderLabel={clearLabel}
          onClick={onClear}
          appearance="plain"
          uiSize="icon"
        >
          <Icon name={clearIconName} size="var(--sz-icon-control)" />
        </Button>
      ) : null}
    </View>
  );
}
