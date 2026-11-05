import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText';
import { BottomSheet } from './BottomSheet';

export type ListSortDirection = 'ASC' | 'DESC';

export interface ListSortOption {
  key: string;
  label: string;
  defaultDir?: ListSortDirection;
  directions?: ListSortDirection[];
}

export interface ListSortValue {
  orderBy: string;
  orderDir: ListSortDirection;
}

export interface ListSortConfig {
  defaultSort: ListSortValue;
  sortOptions: ListSortOption[];
}

const DEFAULT_DIRECTIONS: ListSortDirection[] = ['ASC', 'DESC'];

export function getDefaultListSort(
  options?: ListSortOption[],
  fallback?: ListSortValue,
): ListSortValue | undefined {
  if (fallback) return fallback;
  if (!options?.length) return undefined;
  const firstOption = options[0];
  return {
    orderBy: firstOption.key,
    orderDir: firstOption.defaultDir ?? firstOption.directions?.[0] ?? 'DESC',
  };
}

export function getSortSummary(
  options: ListSortOption[] | undefined,
  value: ListSortValue | undefined,
): string {
  if (!options?.length || !value) return '排序';
  const option = options.find((item) => item.key === value.orderBy);
  if (!option) return '排序';
  const directions = option.directions ?? DEFAULT_DIRECTIONS;
  const suffix = directions.length > 1 ? (value.orderDir === 'ASC' ? '↑' : '↓') : '';
  return `${option.label}${suffix}`;
}

function resolveNextSort(option: ListSortOption, current?: ListSortValue): ListSortValue {
  const directions = option.directions ?? DEFAULT_DIRECTIONS;
  if (current?.orderBy === option.key && directions.length > 1) {
    const currentIndex = directions.indexOf(current.orderDir);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % directions.length : 0;
    return { orderBy: option.key, orderDir: directions[nextIndex] };
  }
  return {
    orderBy: option.key,
    orderDir:
      current?.orderBy === option.key ? current.orderDir : (option.defaultDir ?? directions[0]),
  };
}

interface ListSortSheetProps {
  visible: boolean;
  options: ListSortOption[];
  value?: ListSortValue;
  onChange: (value: ListSortValue) => void;
  onClose: () => void;
}

export function ListSortSheet({ visible, options, value, onChange, onClose }: ListSortSheetProps) {
  const { colors } = useTheme();

  const handleSelect = useCallback(
    (option: ListSortOption) => {
      onChange(resolveNextSort(option, value));
      onClose();
    },
    [onChange, onClose, value],
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title="排序方式" dynamicHeight>
      <View style={styles.list}>
        {options.map((option) => {
          const isSelected = option.key === value?.orderBy;
          const directions = option.directions ?? DEFAULT_DIRECTIONS;
          const currentDir =
            isSelected && value ? value.orderDir : (option.defaultDir ?? directions[0]);
          const dirIcon = currentDir === 'ASC' ? 'arrow-up' : 'arrow-down';
          const dirLabel = currentDir === 'ASC' ? '升序' : '降序';
          const helperText = isSelected
            ? directions.length > 1
              ? '再次点击可切换方向'
              : '当前排序'
            : '点击应用';

          return (
            <Pressable
              key={option.key}
              onPress={() => handleSelect(option)}
              hitSlop={HIT_SLOP}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${option.label}，${dirLabel}`}
              style={({ pressed }) => [
                styles.item,
                {
                  backgroundColor: isSelected
                    ? `${colors.primary}12`
                    : pressed
                      ? colors.surfaceSecondary
                      : colors.surface,
                  borderColor: isSelected ? `${colors.primary}22` : colors.border,
                },
              ]}
            >
              <View style={styles.itemBody}>
                <Text
                  style={[styles.itemLabel, { color: isSelected ? colors.primary : colors.text }]}
                >
                  {option.label}
                </Text>
                <Text style={[styles.itemHint, { color: colors.textSecondary }]}>{helperText}</Text>
              </View>
              <View style={styles.itemAside}>
                <View
                  style={[
                    styles.itemBadge,
                    {
                      backgroundColor: isSelected ? `${colors.primary}14` : colors.surfaceSecondary,
                    },
                  ]}
                >
                  <Ionicons
                    name={dirIcon}
                    size={12}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.itemBadgeText,
                      { color: isSelected ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {dirLabel}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  itemBody: {
    flex: 1,
    gap: 4,
  },
  itemLabel: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  itemHint: {
    fontSize: FontSize.xs,
  },
  itemAside: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  itemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  itemBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
