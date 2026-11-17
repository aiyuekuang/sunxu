import { Text, View } from '@tarojs/components';
import { Icon } from './Icon';

/** Value and decorative disclosure icon for field-specific filter chips. */
export function FilterTriggerContent({ label, className = '' }: { label: string; className?: string }) {
  return (
    <View className={`ui-filter-trigger-content${className ? ` ${className}` : ''}`}>
      <Text className="ui-filter-trigger-content__label">{label}</Text>
      <Icon name="chevron-down" className="ui-filter-trigger-content__chevron" size="var(--sz-icon-small)" />
    </View>
  );
}
