import type { ReactNode } from 'react';
import { Text, View } from '@tarojs/components';
import { Button } from './Button';

export interface BottomTabItem<Key extends string = string> {
  key: Key;
  label: string;
  icon?: ReactNode;
  activeIcon?: ReactNode;
  badge?: number | string;
  badgeLabel?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
}

/** Controlled presentation primitive for a fixed bottom navigation bar. */
export function BottomTabBar<Key extends string>({
  tabs,
  activeKey,
  onChange,
  className = '',
  ariaLabel = '底部导航',
}: {
  tabs: readonly BottomTabItem<Key>[];
  activeKey: Key;
  onChange: (key: Key) => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <View className={`app-bottom-tabbar${className ? ` ${className}` : ''}`} role="navigation" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        const badge = typeof tab.badge === 'number'
          ? (tab.badge > 0 ? String(tab.badge) : '')
          : (tab.badge || '');
        const badgeText = typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : badge;
        const label = tab.accessibilityLabel || [tab.label, badge && (tab.badgeLabel || `${badge}条`) ].filter(Boolean).join('，');
        return (
          <Button
            key={tab.key}
            className={`app-bottom-tabbar__item${active ? ' is-active' : ''}`}
            ariaLabel={label}
            aria-current={active ? 'page' : undefined}
            disabled={tab.disabled}
            onClick={() => onChange(tab.key)}
            plain
            appearance="plain"
            uiSize="link"
          >
            <View className="app-bottom-tabbar__icon" aria-hidden="true">
              {active ? (tab.activeIcon ?? tab.icon) : tab.icon}
            </View>
            {badgeText ? <View className="app-bottom-tabbar__badge" aria-hidden="true"><Text>{badgeText}</Text></View> : null}
            <Text className="app-bottom-tabbar__label">{tab.label}</Text>
          </Button>
        );
      })}
    </View>
  );
}
