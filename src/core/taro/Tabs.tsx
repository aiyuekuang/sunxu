import { ScrollView, Text, View } from '@tarojs/components';
import { useState } from 'react';
import { Button } from './Button';

export type TabOption<T extends string | number> = { value: T; label: string; badge?: boolean };
export type TabsVariant = 'underline' | 'pill' | 'navigation' | 'compact-pill' | 'section' | 'compact-navigation' | 'page-title';

let nextTabsInstanceId = 0;

/** Shared tab navigation/filter row. Business state and content stay with the page. */
export function Tabs<T extends string | number>({
  options,
  value,
  onChange,
  variant = 'underline',
  scrollable = false,
  equalWidth = variant === 'underline' && !scrollable,
  fullBleed = false,
  inset = 'parent',
  className = ''
}: {
  options: readonly TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: TabsVariant;
  scrollable?: boolean;
  equalWidth?: boolean;
  fullBleed?: boolean;
  inset?: 'parent' | 'page';
  className?: string;
}) {
  const [instanceId] = useState(() => `app-tabs-${nextTabsInstanceId++}`);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const rootClass = `ui-tabs ui-tabs--${variant}${variant === 'section' && options.length >= 3 ? ' ui-tabs--three' : ''}${scrollable ? ' ui-tabs--scrollable' : ''}${equalWidth ? ' ui-tabs--equal' : ''}${fullBleed ? ' ui-tabs--full-bleed' : ''}${inset === 'page' ? ' ui-tabs--page-inset' : ''}${className ? ` ${className}` : ''}`;
  const track = (
    <View className="ui-tabs__track">
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <Button
            id={scrollable ? `${instanceId}-tab-${index}` : undefined}
            key={String(option.value)}
            aria-selected={selected}
            ariaLabel={option.label}
            className={`ui-tabs__tab${selected ? ' is-active' : ''}`}
            onClick={() => onChange(option.value)}
            plain
            appearance="plain"
            uiSize="tab"
          >
            <Text>{option.label}</Text>
            {option.badge ? <View className="ui-tabs__badge" aria-hidden /> : null}
            {(variant === 'underline' || variant === 'navigation' || variant === 'section' || variant === 'compact-navigation') && selected ? <View className="ui-tabs__indicator" aria-hidden /> : null}
          </Button>
        );
      })}
    </View>
  );

  return (
    <View className={rootClass} ariaRole="tablist">
      {scrollable ? (
        <ScrollView
          className="ui-tabs__scroll"
          scrollX
          enableFlex
        scrollIntoView={selectedIndex >= 0 ? `${instanceId}-tab-${selectedIndex}` : undefined}
        scrollWithAnimation
        >
          {track}
        </ScrollView>
      ) : track}
    </View>
  );
}
