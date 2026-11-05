import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import { AppText as Text } from './AppText';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import {
  type EntityPickerCategoryOption,
  type EntityPickerFetchFn,
  type EntityPickerQuickFilter,
  EntityPickerModal,
} from './EntityPickerModal';
import { FilterQuickControl } from './FilterQuickControl';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EntityFilterValue {
  id: string;
  display: string;
}

export function entityFilterValueFromStored(
  id?: string,
  display?: string,
): EntityFilterValue | null {
  return id ? { id, display: display ?? '' } : null;
}

export function mergeEntityFilterValue<T extends Record<string, string | undefined>>(
  values: T,
  idKey: keyof T & string,
  displayKey: keyof T & string,
  nextValue: EntityFilterValue | null,
): T {
  return {
    ...values,
    [idKey]: nextValue?.id,
    [displayKey]: nextValue?.display,
  };
}

export interface EntityFilterChipProps<T> {
  /** 筛选标签，如 "物料"、"客户" */
  label: string;
  /** 当前选中值 */
  value: EntityFilterValue | null;
  /** 值变化回调 */
  onChange: (value: EntityFilterValue | null) => void;
  /** 实体列表请求方法 */
  fetchFn: EntityPickerFetchFn<T>;
  /** 实体唯一键提取 */
  keyExtractor: (item: T) => string;
  /** 实体显示名提取 */
  labelExtractor: (item: T) => string;
  /** 实体副标签提取 */
  sublabelExtractor?: (item: T) => string;
  /** 列表项左侧内容，如物料图片 */
  renderLeading?: (item: T) => React.ReactNode;
  /** 列表项补充信息；传入后替代默认副标签 */
  renderDetails?: (item: T) => React.ReactNode;
  /** 分类筛选项；传入后在搜索下方提供快捷筛选 */
  categoryFetchFn?: () => Promise<EntityPickerCategoryOption[]>;
  categoryLayout?: 'quick-filter' | 'sidebar';
  searchPlaceholder?: string;
  /** 可扩展的快捷筛选 */
  quickFilters?: EntityPickerQuickFilter[];
  /** 弹窗标题 */
  title?: string;
  /** 'chip'（默认）实体标签；'inline' 使用快捷筛选控件；'compact' 用于抽屉内低装饰筛选 */
  variant?: 'chip' | 'inline' | 'compact';
}

/**
 * 与 ConfigListScreen 的受控筛选状态配套使用：持久化实体 ID 与显示名，
 * 使页面恢复已记住的筛选后仍能让用户核对当前检索条件。
 */
export interface ManagedEntityFilterChipProps<T> extends Omit<
  EntityFilterChipProps<T>,
  'value' | 'onChange'
> {
  values: Record<string, string | undefined>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
  idKey: string;
  displayKey?: string;
}

export interface EntityFilterRowProps {
  /** 布局自定义 */
  style?: ViewStyle;
  children: React.ReactNode;
}

// ─── EntityFilterChip ─────────────────────────────────────────────────────────

function EntityFilterChipInner<T>({
  label,
  value,
  onChange,
  fetchFn,
  keyExtractor,
  labelExtractor,
  sublabelExtractor,
  renderLeading,
  renderDetails,
  categoryFetchFn,
  categoryLayout,
  searchPlaceholder,
  quickFilters,
  title,
  variant = 'chip',
}: EntityFilterChipProps<T>) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const isActive = value !== null;
  const isInline = variant === 'inline';
  const isCompact = variant === 'compact';

  return (
    <>
      {isInline ? (
        <FilterQuickControl
          label={value?.display ? `${label}: ${value.display}` : label}
          active={isActive}
          badgeCount={isActive ? 1 : 0}
          onPress={() => setModalVisible(true)}
          accessibilityLabel={isActive ? `${label}：${value.display}` : `选择${label}`}
        />
      ) : (
        <TouchableOpacity
          style={[
            isCompact ? styles.compact : styles.chip,
            {
              backgroundColor: isCompact ? 'transparent' : colors.surfaceSecondary,
              borderColor: isCompact && isActive ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 4, right: 0, bottom: 4, left: 0 }}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={isActive ? `${label}：${value.display}` : `选择${label}`}
        >
          <Text
            style={[styles.chipLabel, { color: isActive ? colors.primary : colors.textSecondary }]}
            numberOfLines={1}
          >
            {`${label}${isActive ? `: ${value.display}` : ''}`}
          </Text>
          {isActive ? (
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
              onPress={() => onChange(null)}
            >
              <Ionicons name="close-circle" size={14} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      )}

      <EntityPickerModal<T>
        visible={modalVisible}
        title={title ?? `选择${label}`}
        fetchFn={fetchFn}
        keyExtractor={keyExtractor}
        labelExtractor={labelExtractor}
        sublabelExtractor={sublabelExtractor}
        renderLeading={renderLeading}
        renderDetails={renderDetails}
        categoryFetchFn={categoryFetchFn}
        categoryLayout={categoryLayout}
        searchPlaceholder={searchPlaceholder}
        quickFilters={quickFilters}
        selectedKey={value?.id}
        clearable
        onClose={() => setModalVisible(false)}
        onConfirm={(items) => {
          const item = items[0];
          if (item) {
            onChange({ id: keyExtractor(item), display: labelExtractor(item) });
          }
          setModalVisible(false);
        }}
        onClear={() => {
          onChange(null);
          setModalVisible(false);
        }}
      />
    </>
  );
}

export const EntityFilterChip = React.memo(EntityFilterChipInner) as typeof EntityFilterChipInner;

export function ManagedEntityFilterChip<T>({
  values,
  setValues,
  idKey,
  displayKey = `${idKey}Display`,
  ...props
}: ManagedEntityFilterChipProps<T>) {
  return (
    <EntityFilterChip<T>
      {...props}
      value={entityFilterValueFromStored(values[idKey], values[displayKey])}
      onChange={(next) =>
        setValues((current) => mergeEntityFilterValue(current, idKey, displayKey, next))
      }
    />
  );
}

// ─── EntityFilterRow ──────────────────────────────────────────────────────────

export function EntityFilterRow({ style, children }: EntityFilterRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, style]}
    >
      {children}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    maxWidth: 180,
  },
  compact: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 36,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 240,
  },
  chipLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
