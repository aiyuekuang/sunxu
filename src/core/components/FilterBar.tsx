import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText';
import { DatePickerField } from './DatePickerField';
import { DateRangeQuickSelect } from './DateRangeQuickSelect';
import { FilterActionButton } from './FilterActionButton';
import { FilterQuickControl } from './FilterQuickControl';

export interface FilterOption {
  label: string;
  value: string;
}

/** 下拉选项筛选（快捷筛选 + 高级筛选均可用） */
export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  /** 是否参与筛选记忆，默认 true。设为 false 则该字段不会被保存/恢复 */
  persist?: boolean;
}

/** 日期范围筛选（仅高级筛选可用） */
export interface DateRangeFilterConfig {
  type: 'date_range';
  key: string;
  label: string;
  /** 开始日期对应的参数名，如 'startDate' */
  startKey: string;
  /** 结束日期对应的参数名，如 'endDate' */
  endKey: string;
  /** 是否参与筛选记忆，默认 true。设为 false 则该字段不会被保存/恢复 */
  persist?: boolean;
}

/** 高级筛选配置项（支持选项型和日期范围型） */
export type AdvancedFilterConfig = FilterConfig | DateRangeFilterConfig;

export function isDateRange(f: AdvancedFilterConfig): f is DateRangeFilterConfig {
  return 'type' in f && f.type === 'date_range';
}

// ─── 统一筛选配置（新 API） ──────────────────────────────────────────────────

/** 筛选项放置位置：tab=底部标签, quick=快捷下拉, advanced=高级筛选弹窗 */
export type FilterPlacement = 'tab' | 'quick' | 'advanced';

/** 选项型统一筛选配置 */
export interface OptionFilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  placement: FilterPlacement;
  /** tab 专用：是否可横向滚动，默认 false */
  scrollable?: boolean;
  /** tab 专用：是否自动补"全部"项，默认 true */
  includeAllOption?: boolean;
  /** 是否参与筛选记忆，默认 true。设为 false 则该字段不会被保存/恢复 */
  persist?: boolean;
}

/** 日期范围型统一筛选配置（仅限 advanced） */
export interface DateRangeListFilterConfig {
  type: 'date_range';
  key: string;
  label: string;
  startKey: string;
  endKey: string;
  placement: 'advanced';
  /** 是否参与筛选记忆，默认 true。设为 false 则该字段不会被保存/恢复 */
  persist?: boolean;
}

/** 统一筛选配置项 */
export type ListFilterConfig = OptionFilterConfig | DateRangeListFilterConfig;

export interface AdvancedFilterExtraArgs {
  values: Record<string, string | undefined>;
  setValue: (key: string, value: string | undefined) => void;
}

export interface FilterBarProps {
  /** 快捷筛选（搜索栏下方，最多4个） */
  quickFilters: FilterConfig[];
  /** 高级筛选（弹窗中，支持选项型和日期范围型） */
  advancedFilters?: AdvancedFilterConfig[];
  /** 高级筛选面板中的业务自定义条件（如需搜索的物料、仓库等实体） */
  advancedExtra?: (args: AdvancedFilterExtraArgs) => React.ReactNode;
  /** 自定义高级条件对应的值 key，用于暂存、应用和统计已选数量 */
  advancedExtraKeys?: string[];
  /** 自定义高级条件中实际参与已选数量统计的 key */
  advancedExtraActiveKeys?: string[];
  /** 当前值 */
  values: Record<string, string | undefined>;
  /** 筛选变化回调 */
  onChange: (values: Record<string, string | undefined>) => void;
  /** 持久化 key，传入后支持"记住筛选"（如 'equipment'） */
  storageKey?: string;
  /** 隐藏内联的高级筛选按钮（由外部通过 ref 触发） */
  hideAdvancedButton?: boolean;
  /** 额外筛选内容，渲染在快捷筛选行末尾（如 EntityFilterChip） */
  extra?: React.ReactNode;
  /** 行首控制项（如排序） */
  leadingControl?: {
    label: string;
    onPress: () => void;
    active?: boolean;
  };
  /** 记住筛选开关变化回调（通知父组件持久化 tab 等状态） */
  onSaveEnabledChange?: (enabled: boolean) => void;
  /** 初始持久化筛选恢复完成回调 */
  onHydrated?: () => void;
  /** 重置全部筛选（包括快捷筛选和页面外部状态） */
  onResetAll?: () => void;
}

export interface FilterBarRef {
  openAdvanced: () => void;
  /** 当前是否启用了记住筛选 */
  isSaveEnabled: () => boolean;
}

/** 导出存储 key 前缀，供 ConfigListScreen 持久化 tab 使用 */
export const FILTER_TAB_PREFIX = 'mes_filter_tab_';
export { SAVE_FLAG_PREFIX as FILTER_SAVE_FLAG_PREFIX };

const STORAGE_PREFIX = 'mes_filter_';
const SAVE_FLAG_PREFIX = 'mes_filter_save_';

export const FilterBar = React.forwardRef<FilterBarRef, FilterBarProps>(function FilterBar(
  {
    quickFilters,
    advancedFilters = [],
    advancedExtra,
    advancedExtraKeys = [],
    advancedExtraActiveKeys = advancedExtraKeys,
    values,
    onChange,
    storageKey,
    hideAdvancedButton = false,
    extra,
    leadingControl,
    onSaveEnabledChange,
    onHydrated,
    onResetAll,
  },
  ref,
) {
  const { colors } = useTheme();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [advancedVisible, setAdvancedVisible] = useState(false);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const sheetRef = useRef<BottomSheetModal>(null);
  const [localAdvanced, setLocalAdvanced] = useState<Record<string, string | undefined>>({});
  const quickRowRef = useRef<View>(null);
  const [dropdownTop, setDropdownTop] = useState(140);
  const advancedDateRangeInvalid = useMemo(
    () =>
      advancedFilters.some((filter) => {
        if (!isDateRange(filter)) return false;
        const start = localAdvanced[filter.startKey];
        const end = localAdvanced[filter.endKey];
        return Boolean((start && !end) || (!start && end) || (start && end && start > end));
      }),
    [advancedFilters, localAdvanced],
  );

  // 构建所有选项型筛选的 options 索引，用于验证失效值
  const allOptionSets = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const f of quickFilters) {
      map.set(f.key, new Set(f.options.map((o) => o.value)));
    }
    if (advancedFilters) {
      for (const f of advancedFilters) {
        if (!isDateRange(f)) {
          map.set(f.key, new Set(f.options.map((o) => o.value)));
        }
      }
    }
    return map;
  }, [quickFilters, advancedFilters]);

  // 构建允许恢复/持久化的 key 集合，避免旧版本残留筛选在当前页面中“隐身生效”
  const persistableKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const f of quickFilters) {
      if (f.persist !== false) keys.add(f.key);
    }
    if (advancedFilters) {
      for (const f of advancedFilters) {
        if (f.persist === false) continue;
        if (isDateRange(f)) {
          keys.add(f.startKey);
          keys.add(f.endKey);
        } else {
          keys.add(f.key);
        }
      }
    }
    return keys;
  }, [quickFilters, advancedFilters]);

  // 构建不参与持久化的 key 集合（只看 persist: false）
  const nonPersistKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const f of quickFilters) {
      if (f.persist === false) keys.add(f.key);
    }
    if (advancedFilters) {
      for (const f of advancedFilters) {
        if (f.persist === false) {
          if (isDateRange(f)) {
            keys.add(f.startKey);
            keys.add(f.endKey);
          } else {
            keys.add(f.key);
          }
        }
      }
    }
    return keys;
  }, [quickFilters, advancedFilters]);

  // 用 ref 持有最新值，避免恢复 effect 因函数/对象引用变化而重复执行
  const allOptionSetsRef = useRef(allOptionSets);
  allOptionSetsRef.current = allOptionSets;
  const persistableKeysRef = useRef(persistableKeys);
  persistableKeysRef.current = persistableKeys;
  const nonPersistKeysRef = useRef(nonPersistKeys);
  nonPersistKeysRef.current = nonPersistKeys;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onSaveEnabledChangeRef = useRef(onSaveEnabledChange);
  onSaveEnabledChangeRef.current = onSaveEnabledChange;
  const onHydratedRef = useRef(onHydrated);
  onHydratedRef.current = onHydrated;

  // 加载保存的筛选（含失效值验证）
  useEffect(() => {
    if (!storageKey) {
      onHydratedRef.current?.();
      return;
    }
    (async () => {
      try {
        const [saved, flag] = await Promise.all([
          AsyncStorage.getItem(STORAGE_PREFIX + storageKey),
          AsyncStorage.getItem(SAVE_FLAG_PREFIX + storageKey),
        ]);
        const shouldSave = flag === '1';
        setSaveEnabled(shouldSave);
        onSaveEnabledChangeRef.current?.(shouldSave);
        if (shouldSave && saved) {
          try {
            const parsed = JSON.parse(saved) as Record<string, string>;
            // 验证：排除不持久化的字段 + 选项型筛选检查失效值
            const validated: Record<string, string> = {};
            for (const [key, value] of Object.entries(parsed)) {
              // 跳过不参与持久化的字段（如日期范围）
              if (nonPersistKeysRef.current.has(key)) continue;
              // 丢弃当前页面配置中不存在的旧筛选 key，避免隐藏筛选继续生效
              if (!persistableKeysRef.current.has(key)) continue;
              const optionSet = allOptionSetsRef.current.get(key);
              if (optionSet) {
                // 选项型筛选：值必须存在于当前选项中
                if (optionSet.has(value)) {
                  validated[key] = value;
                }
              } else {
                // 其他类型：保留原值
                validated[key] = value;
              }
            }
            onChangeRef.current(validated);
          } catch {}
        }
      } finally {
        onHydratedRef.current?.();
      }
    })();
  }, [storageKey]);

  // 保存筛选值（自动排除 nonPersistKeys 中的字段）
  const persistValues = useCallback(
    async (vals: Record<string, string | undefined>) => {
      if (!storageKey || !saveEnabled) return;
      const cleaned: Record<string, string> = {};
      for (const [k, v] of Object.entries(vals)) {
        if (v && !nonPersistKeys.has(k)) cleaned[k] = v;
      }
      await AsyncStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(cleaned));
    },
    [storageKey, saveEnabled, nonPersistKeys],
  );

  // 快捷筛选点击
  const handleQuickSelect = useCallback(
    (key: string, value: string) => {
      const newValues = { ...values, [key]: values[key] === value ? undefined : value };
      onChange(newValues);
      persistValues(newValues);
      setActiveDropdown(null);
    },
    [values, onChange, persistValues],
  );

  // 高级筛选
  const openAdvanced = useCallback(() => {
    const advVals: Record<string, string | undefined> = {};
    advancedFilters.forEach((f) => {
      if (isDateRange(f)) {
        advVals[f.startKey] = values[f.startKey];
        advVals[f.endKey] = values[f.endKey];
      } else {
        advVals[f.key] = values[f.key];
      }
    });
    for (const key of advancedExtraKeys) {
      advVals[key] = values[key];
    }
    setLocalAdvanced(advVals);
    setAdvancedVisible(true);
    setTimeout(() => sheetRef.current?.present(), 50);
  }, [advancedExtraKeys, advancedFilters, values]);

  const handleAdvancedApply = useCallback(() => {
    if (advancedDateRangeInvalid) return;
    const newValues = { ...values };
    advancedFilters.forEach((f) => {
      if (isDateRange(f)) {
        const sv = localAdvanced[f.startKey];
        const ev = localAdvanced[f.endKey];
        if (sv) newValues[f.startKey] = sv;
        else delete newValues[f.startKey];
        if (ev) newValues[f.endKey] = ev;
        else delete newValues[f.endKey];
      } else {
        const v = localAdvanced[f.key];
        if (v) newValues[f.key] = v;
        else delete newValues[f.key];
      }
    });
    for (const key of advancedExtraKeys) {
      const value = localAdvanced[key];
      if (value) newValues[key] = value;
      else delete newValues[key];
    }
    onChange(newValues);
    persistValues(newValues);
    sheetRef.current?.dismiss();
    setAdvancedVisible(false);
  }, [
    advancedExtraKeys,
    values,
    localAdvanced,
    advancedFilters,
    onChange,
    persistValues,
    advancedDateRangeInvalid,
  ]);

  const handleAdvancedReset = useCallback(() => {
    setLocalAdvanced({});
    onResetAll?.();
  }, [onResetAll]);

  useEffect(() => {
    if (!advancedVisible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      sheetRef.current?.dismiss();
      return true;
    });
    return () => sub.remove();
  }, [advancedVisible]);

  const handleSaveToggle = useCallback(
    async (enabled: boolean) => {
      setSaveEnabled(enabled);
      onSaveEnabledChange?.(enabled);
      if (storageKey) {
        await AsyncStorage.setItem(SAVE_FLAG_PREFIX + storageKey, enabled ? '1' : '0');
        if (!enabled) {
          await AsyncStorage.removeItem(STORAGE_PREFIX + storageKey);
        } else {
          await persistValues(values);
        }
      }
    },
    [storageKey, values, persistValues, onSaveEnabledChange],
  );

  const advancedActiveCount =
    advancedFilters.filter((f) =>
      isDateRange(f) ? values[f.startKey] || values[f.endKey] : values[f.key],
    ).length + advancedExtraActiveKeys.filter((key) => values[key]).length;

  useImperativeHandle(ref, () => ({ openAdvanced, isSaveEnabled: () => saveEnabled }), [
    openAdvanced,
    saveEnabled,
  ]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <>
      {/* 快捷筛选行：仅在有可见内容时渲染。高级筛选按钮隐藏时由调用方提供入口，
          不能只为 advancedFilters 存在就撑出一条空行 */}
      {(quickFilters.length > 0 ||
        advancedExtra ||
        leadingControl ||
        extra ||
        (!hideAdvancedButton && advancedFilters.length > 0)) && (
        <View ref={quickRowRef} style={[styles.quickRow, { borderBottomColor: colors.border }]}>
          <ScrollView
            style={styles.quickScroll}
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.quickScrollContent}
          >
            {leadingControl && (
              <FilterQuickControl
                label={leadingControl.label}
                active={leadingControl.active}
                onPress={leadingControl.onPress}
                accessibilityLabel={`${leadingControl.label}，点击选择排序方式`}
              />
            )}

            {quickFilters.map((filter) => {
              const selected = values[filter.key];
              const selectedLabel = filter.options.find((o) => o.value === selected)?.label;
              const isOpen = activeDropdown === filter.key;
              return (
                <FilterQuickControl
                  key={filter.key}
                  label={selectedLabel || filter.label}
                  active={Boolean(selected)}
                  expanded={isOpen}
                  onPress={() => {
                    if (isOpen) {
                      setActiveDropdown(null);
                    } else {
                      quickRowRef.current?.measure((_fx, _fy, _w, _h, _px, py) => {
                        setDropdownTop(py + _h);
                        setActiveDropdown(filter.key);
                      });
                    }
                  }}
                  accessibilityLabel={selectedLabel || filter.label}
                />
              );
            })}

            {extra}
          </ScrollView>
          {/* 高级筛选按钮固定在最右侧，仅保留无背景图标 */}
          {!hideAdvancedButton && (advancedFilters.length > 0 || advancedExtra) && (
            <View style={styles.advancedAction}>
              <FilterActionButton
                iconOnly
                size="compact"
                appearance="plain"
                count={advancedActiveCount}
                onPress={openAdvanced}
                accessibilityLabel="打开筛选"
              />
            </View>
          )}
        </View>
      )}

      {/* 下拉选项面板 */}
      {activeDropdown && (
        <Modal
          transparent
          visible
          animationType="fade"
          onRequestClose={() => setActiveDropdown(null)}
        >
          <Pressable style={styles.dropdownOverlay} onPress={() => setActiveDropdown(null)}>
            <View
              style={[styles.dropdownPanel, { backgroundColor: colors.surface, top: dropdownTop }]}
            >
              {(() => {
                const filter = quickFilters.find((f) => f.key === activeDropdown);
                if (!filter) return null;
                return (
                  <ScrollView
                    style={styles.dropdownContent}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                  >
                    <TouchableOpacity
                      style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: !values[filter.key] }}
                      onPress={() => {
                        onChange({ ...values, [filter.key]: undefined });
                        persistValues({ ...values, [filter.key]: undefined });
                        setActiveDropdown(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: !values[filter.key] ? colors.primary : colors.text },
                        ]}
                      >
                        全部
                      </Text>
                      {!values[filter.key] && (
                        <Ionicons name="checkmark" size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                    {filter.options.map((opt) => {
                      const isSel = values[filter.key] === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: isSel }}
                          onPress={() => handleQuickSelect(filter.key, opt.value)}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              { color: isSel ? colors.primary : colors.text },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {isSel && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                );
              })()}
            </View>
          </Pressable>
        </Modal>
      )}

      {/* 高级筛选弹窗 */}
      {advancedVisible && (
        <BottomSheetModal
          ref={sheetRef}
          onDismiss={() => setAdvancedVisible(false)}
          enableDynamicSizing
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: colors.surface }}
          handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
        >
          <BottomSheetView style={styles.advContainer}>
            {/* Header */}
            <View style={[styles.advHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity
                style={styles.advHeaderButton}
                onPress={handleAdvancedReset}
                accessibilityRole="button"
              >
                <Text style={[styles.advHeaderBtn, { color: colors.textSecondary }]}>重置</Text>
              </TouchableOpacity>
              <Text style={[styles.advTitle, { color: colors.text }]}>高级筛选</Text>
              <TouchableOpacity
                style={styles.advHeaderButton}
                onPress={handleAdvancedApply}
                disabled={advancedDateRangeInvalid}
                accessibilityRole="button"
                accessibilityState={{ disabled: advancedDateRangeInvalid }}
              >
                <Text
                  style={[
                    styles.advHeaderBtn,
                    {
                      color: advancedDateRangeInvalid ? colors.textTertiary : colors.primary,
                      fontWeight: '600',
                    },
                  ]}
                >
                  应用
                </Text>
              </TouchableOpacity>
            </View>

            {/* 筛选项 */}
            {advancedFilters.map((filter) => (
              <View key={filter.key} style={styles.advGroup}>
                <Text style={[styles.advLabel, { color: colors.text }]}>{filter.label}</Text>
                {isDateRange(filter) ? (
                  <View style={styles.dateRangeGroup}>
                    <View style={styles.dateRangeRow}>
                      <DatePickerField
                        label=""
                        compact
                        value={localAdvanced[filter.startKey]}
                        onChange={(value) =>
                          setLocalAdvanced((current) => ({
                            ...current,
                            [filter.startKey]: value,
                          }))
                        }
                        placeholder="开始日期"
                        maximumDate={localAdvanced[filter.endKey] || undefined}
                        containerStyle={styles.dateField}
                      />
                      <Text style={[styles.dateRangeSep, { color: colors.textMuted }]}>—</Text>
                      <DatePickerField
                        label=""
                        compact
                        value={localAdvanced[filter.endKey]}
                        onChange={(value) =>
                          setLocalAdvanced((current) => ({
                            ...current,
                            [filter.endKey]: value,
                          }))
                        }
                        placeholder="结束日期"
                        minimumDate={localAdvanced[filter.startKey] || undefined}
                        containerStyle={styles.dateField}
                      />
                    </View>
                    <DateRangeQuickSelect
                      onSelect={([startDate, endDate]) =>
                        setLocalAdvanced((current) => ({
                          ...current,
                          [filter.startKey]: startDate,
                          [filter.endKey]: endDate,
                        }))
                      }
                    />
                  </View>
                ) : (
                  <View style={styles.advOptions}>
                    {filter.options.map((opt) => {
                      const isSel = localAdvanced[filter.key] === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[
                            styles.advChip,
                            { backgroundColor: isSel ? colors.primary : colors.surfaceSecondary },
                          ]}
                          hitSlop={{ top: 4, right: 0, bottom: 4, left: 0 }}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: isSel }}
                          onPress={() =>
                            setLocalAdvanced((prev) => ({
                              ...prev,
                              [filter.key]: prev[filter.key] === opt.value ? undefined : opt.value,
                            }))
                          }
                        >
                          <Text
                            style={[
                              styles.advChipText,
                              { color: isSel ? colors.textOnPrimary : colors.textSecondary },
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}

            {advancedExtra?.({
              values: localAdvanced,
              setValue: (key, value) =>
                setLocalAdvanced((current) => ({ ...current, [key]: value })),
            })}

            {/* 记住筛选开关 */}
            {storageKey && (
              <View style={[styles.saveRow, { borderTopColor: colors.border }]}>
                <View>
                  <Text style={[styles.saveLabel, { color: colors.text }]}>记住筛选条件</Text>
                  <Text style={[styles.saveHint, { color: colors.textSecondary }]}>
                    下次进入页面自动应用
                  </Text>
                </View>
                <Switch
                  value={saveEnabled}
                  onValueChange={handleSaveToggle}
                  trackColor={{ false: colors.border, true: `${colors.primary}80` }}
                  thumbColor={saveEnabled ? colors.primary : colors.border}
                />
              </View>
            )}

            <View style={{ height: Spacing.xl }} />
          </BottomSheetView>
        </BottomSheetModal>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  // --- 快捷筛选行 ---
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: MIN_TOUCH_TARGET - Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
  },
  quickScroll: {
    flex: 1,
    height: MIN_TOUCH_TARGET - Spacing.sm,
  },
  advancedAction: {
    height: MIN_TOUCH_TARGET - Spacing.sm,
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  quickScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: MIN_TOUCH_TARGET - Spacing.sm,
    gap: Spacing.xs,
    paddingRight: Spacing.sm,
  },
  // --- 下拉面板 ---
  dropdownOverlay: {
    flex: 1,
  },
  dropdownPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    maxHeight: Dimensions.get('window').height * 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownContent: {
    paddingBottom: Spacing.xs,
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownItemText: {
    fontSize: FontSize.sm,
  },

  // --- 高级筛选弹窗 ---
  advContainer: {
    paddingHorizontal: Spacing.md,
  },
  advHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  advTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  advHeaderBtn: {
    fontSize: FontSize.sm,
  },
  advHeaderButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advGroup: {
    marginTop: Spacing.md,
  },
  advLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginBottom: 6,
  },
  advOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  advChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  advChipText: {
    fontSize: FontSize.xs,
  },

  // --- 日期范围 ---
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dateRangeGroup: {
    gap: Spacing.xs,
  },
  dateField: {
    flex: 1,
  },
  dateRangeSep: {
    fontSize: FontSize.xs,
  },

  // --- 记住筛选 ---
  saveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveLabel: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  saveHint: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
