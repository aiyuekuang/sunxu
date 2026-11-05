import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from './AppText.tsx';
import { EmptyState } from './EmptyState.tsx';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { hasMoreEntityPickerResults } from '../utils/entity-picker-pagination';
import { BottomSheet } from './BottomSheet.tsx';
import { FilterQuickControl } from './FilterQuickControl.tsx';
import { SearchBar } from './SearchBar.tsx';

export interface EntityPickerFetchParams {
  page: number;
  pageSize: number;
  keyword?: string;
  categoryId?: string;
  /** quickFilters 可声明的业务查询条件通过 queryParam 放在这里。 */
  [key: string]: string | number | undefined;
}

export type EntityPickerFetchFn<T> = (
  params: EntityPickerFetchParams,
) => Promise<{ list: T[]; total: number }>;

export interface EntityPickerCategoryOption {
  id: string;
  name: string;
  displayName?: string;
}

export interface EntityPickerQuickFilterOption {
  label: string;
  value: string;
}

/** 选择结果区上方的快捷筛选；选中值按 queryParam 传给 fetchFn。 */
export interface EntityPickerQuickFilter {
  key: string;
  label: string;
  queryParam: string;
  options: EntityPickerQuickFilterOption[];
}

const CATEGORY_QUICK_FILTER_KEY = '__entity_picker_category__';

export interface EntityPickerModalProps<T> {
  visible: boolean;
  title: string;
  fetchFn: EntityPickerFetchFn<T>;
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
  sublabelExtractor?: (item: T) => string;
  initialSelected?: T[];
  multi?: boolean;
  onClose: () => void;
  onConfirm: (items: T[]) => void;
  /** 当前已选中项的 key（单选模式高亮用） */
  selectedKey?: string;
  /** 是否显示"清除选择"按钮 */
  clearable?: boolean;
  /** 清除回调 */
  onClear?: () => void;
  // 新增：自定义渲染额外信息
  renderExtra?: (item: T) => React.ReactNode;
  // 新增：额外操作点击事件
  onExtraPress?: (item: T) => void;
  /** 返回禁用原因字符串则该项不可选；返回 null/undefined 则可选 */
  disabledExtractor?: (item: T) => string | null | undefined;
  /** 列表项左侧内容，如物料图片 */
  renderLeading?: (item: T) => React.ReactNode;
  /** 列表项补充信息；传入后替代默认副标签 */
  renderDetails?: (item: T) => React.ReactNode;
  /** 分类筛选项；传入后在搜索下方提供快捷筛选 */
  categoryFetchFn?: () => Promise<EntityPickerCategoryOption[]>;
  /** 可扩展的快捷筛选 */
  quickFilters?: EntityPickerQuickFilter[];
}

const PAGE_SIZE = 20;

export function EntityPickerModal<T>({
  visible,
  title,
  fetchFn,
  keyExtractor,
  labelExtractor,
  sublabelExtractor,
  initialSelected = [],
  multi = false,
  onClose,
  onConfirm,
  selectedKey,
  clearable,
  onClear,
  renderExtra,
  onExtraPress,
  disabledExtractor,
  renderLeading,
  renderDetails,
  categoryFetchFn,
  quickFilters = [],
}: EntityPickerModalProps<T>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [list, setList] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<T[]>(initialSelected);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<EntityPickerCategoryOption[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const [quickFilterValues, setQuickFilterValues] = useState<Record<string, string>>({});
  const [activeQuickFilterKey, setActiveQuickFilterKey] = useState<string | null>(null);

  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const keywordRef = useRef('');
  const generationRef = useRef(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const categoryRequestRef = useRef(0);
  const categoryIdRef = useRef<string | undefined>(undefined);
  const quickFilterValuesRef = useRef<Record<string, string>>({});
  const quickFiltersRef = useRef(quickFilters);
  quickFiltersRef.current = quickFilters;
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;
  const categoryFetchFnRef = useRef(categoryFetchFn);
  categoryFetchFnRef.current = categoryFetchFn;
  const initialSelectedRef = useRef(initialSelected);
  initialSelectedRef.current = initialSelected;
  const prevVisibleRef = useRef(false);

  const load = useCallback(async (reset: boolean, kw: string, forceRetry = false) => {
    if (loadingRef.current && !reset) return;
    if (!forceRetry && !reset && !hasMoreRef.current) return;

    const generation = ++generationRef.current;
    const nextPage = reset ? 1 : pageRef.current + 1;

    loadingRef.current = true;
    setLoading(true);
    setLoadError(false);
    if (reset) setList([]);

    try {
      const filterParams: Record<string, string> = {};
      for (const filter of quickFiltersRef.current) {
        const value = quickFilterValuesRef.current[filter.key];
        if (value && filter.queryParam) filterParams[filter.queryParam] = value;
      }

      const fetchParams = {
        page: nextPage,
        pageSize: PAGE_SIZE,
        keyword: kw || undefined,
        categoryId: categoryIdRef.current,
        ...filterParams,
      };
      const res = await fetchFnRef.current(fetchParams);

      if (generation !== generationRef.current) return;

      if (reset) {
        setList(res.list);
      } else {
        setList((prev) => [...prev, ...res.list]);
      }
      pageRef.current = nextPage;
      hasMoreRef.current = hasMoreEntityPickerResults(nextPage, PAGE_SIZE, res.total);
    } catch (e: unknown) {
      if (axios.isCancel(e) || (e instanceof Error && e.message === 'canceled')) return;
      // 请求失败时停止加载更多，防止 onEndReached 无限循环；保留已加载结果并展示重试。
      hasMoreRef.current = false;
      setLoadError(true);
    } finally {
      if (generation === generationRef.current) {
        loadingRef.current = false;
        setLoading(false);
        setLoaded(true);
      }
    }
  }, []);

  const loadCategories = useCallback(async () => {
    const fetchCategories = categoryFetchFnRef.current;
    if (!fetchCategories) return;

    const requestId = ++categoryRequestRef.current;
    setCategoryLoading(true);
    setCategoryError(false);
    try {
      const result = await fetchCategories();
      if (requestId === categoryRequestRef.current) setCategoryOptions(result);
    } catch {
      if (requestId === categoryRequestRef.current) {
        setCategoryOptions([]);
        setCategoryError(true);
      }
    } finally {
      if (requestId === categoryRequestRef.current) setCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only reset when modal opens (visible: false → true), not on every initialSelected change
    if (visible && !prevVisibleRef.current) {
      generationRef.current++;
      loadingRef.current = false;
      setSelected(initialSelectedRef.current);
      setList([]);
      setKeyword('');
      keywordRef.current = '';
      quickFilterValuesRef.current = {};
      setQuickFilterValues({});
      categoryIdRef.current = undefined;
      pageRef.current = 0;
      hasMoreRef.current = true;
      setLoaded(false);
      if (categoryFetchFnRef.current) void loadCategories();
      load(true, '');
    }
    prevVisibleRef.current = visible;
  }, [visible, load, loadCategories]);

  const handleSearch = (text: string) => {
    setKeyword(text);
    keywordRef.current = text;
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      pageRef.current = 0;
      hasMoreRef.current = true;
      load(true, text);
    }, 400);
  };

  const handleQuickFilterChange = (key: string, value: string) => {
    const nextValues = { ...quickFilterValuesRef.current, [key]: value };
    quickFilterValuesRef.current = nextValues;
    setQuickFilterValues(nextValues);
    if (key === CATEGORY_QUICK_FILTER_KEY) categoryIdRef.current = value || undefined;
    pageRef.current = 0;
    hasMoreRef.current = true;
    setActiveQuickFilterKey(null);
    load(true, keywordRef.current);
  };

  const onEndReached = () => {
    if (!loading) load(false, keywordRef.current);
  };

  const handleToggle = (item: T) => {
    const key = keyExtractor(item);
    if (multi) {
      setSelected((prev) => {
        const exists = prev.some((s) => keyExtractor(s) === key);
        return exists ? prev.filter((s) => keyExtractor(s) !== key) : [...prev, item];
      });
    } else {
      onConfirm([item]);
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  const isItemSelected = (item: T) => {
    if (selectedKey && !multi) return keyExtractor(item) === selectedKey;
    return selected.some((s) => keyExtractor(s) === keyExtractor(item));
  };

  const categoryList = useMemo(
    () => [{ id: null, name: '全部', displayName: '全部' }, ...categoryOptions],
    [categoryOptions],
  );

  const quickFilterGroups = useMemo(() => {
    const categoryGroup = categoryFetchFn
      ? [
          {
            key: CATEGORY_QUICK_FILTER_KEY,
            label: '物料分类',
            queryParam: 'categoryId',
            options: categoryList.map((item) => ({
              label: item.displayName ?? item.name,
              value: item.id ?? '',
            })),
          },
        ]
      : [];
    return [
      ...categoryGroup,
      ...quickFilters.filter((filter) => filter.key !== CATEGORY_QUICK_FILTER_KEY),
    ];
  }, [categoryFetchFn, categoryList, quickFilters]);

  const activeQuickFilter = quickFilterGroups.find((filter) => filter.key === activeQuickFilterKey);

  useEffect(() => {
    if (!visible) setActiveQuickFilterKey(null);
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <BottomSheetModalProvider>
        <KeyboardAvoidingView
          style={[styles.container, { backgroundColor: colors.background }]}
          behavior="padding"
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                borderBottomColor: colors.border,
                backgroundColor: colors.surface,
                paddingTop: insets.top + Spacing.xs,
              },
            ]}
          >
            <TouchableOpacity onPress={onClose} hitSlop={HIT_SLOP} style={styles.headerAction}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
            {clearable && selectedKey ? (
              <TouchableOpacity onPress={onClear} hitSlop={HIT_SLOP} style={styles.headerAction}>
                <Text style={[styles.clearText, { color: colors.primary }]}>清除</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.headerPlaceholder} />
            )}
          </View>

          <View style={styles.contentRow}>
            <View style={styles.archivePane}>
              <View
                style={[
                  styles.searchRow,
                  { borderBottomColor: colors.border, backgroundColor: colors.surface },
                ]}
              >
                <SearchBar
                  value={keyword}
                  onChangeText={handleSearch}
                  placeholder="搜索编码/名称/规格..."
                  autoCorrect={false}
                />
              </View>

              {quickFilterGroups.length > 0 ? (
                <View
                  style={[
                    styles.quickFiltersRow,
                    { borderBottomColor: colors.border, backgroundColor: colors.surface },
                  ]}
                >
                  {quickFilterGroups.map((filter) => {
                    const value = quickFilterValues[filter.key] ?? '';
                    const selectedOption = filter.options.find((option) => option.value === value);
                    const isActive = Boolean(value);
                    return (
                      <FilterQuickControl
                        key={filter.key}
                        label={isActive ? (selectedOption?.label ?? filter.label) : filter.label}
                        active={isActive}
                        expanded={activeQuickFilterKey === filter.key}
                        badgeCount={isActive ? 1 : 0}
                        onPress={() => {
                          Keyboard.dismiss();
                          setActiveQuickFilterKey(filter.key);
                        }}
                        accessibilityLabel={
                          isActive
                            ? `${filter.label}：${selectedOption?.label ?? value}`
                            : `筛选${filter.label}`
                        }
                      />
                    );
                  })}
                </View>
              ) : null}

              <FlatList
                data={list}
                keyExtractor={keyExtractor}
                style={styles.archiveList}
                keyboardShouldPersistTaps="handled"
                onEndReached={onEndReached}
                onEndReachedThreshold={0.3}
                renderItem={({ item }) => {
                  const sel = isItemSelected(item);
                  const label = labelExtractor(item);
                  const sublabel = sublabelExtractor?.(item);
                  const extra = renderExtra?.(item);
                  const disabledReason = disabledExtractor?.(item);
                  const isDisabled = !!disabledReason;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.item,
                        { borderBottomColor: colors.borderLight },
                        sel && !isDisabled && { backgroundColor: colors.primarySurface },
                        isDisabled && { opacity: 0.5 },
                      ]}
                      onPress={() => !isDisabled && handleToggle(item)}
                      activeOpacity={isDisabled ? 1 : 0.6}
                    >
                      {multi && (
                        <View
                          style={[
                            styles.checkbox,
                            {
                              borderColor: isDisabled
                                ? colors.border
                                : sel
                                  ? colors.primary
                                  : colors.border,
                              backgroundColor: isDisabled
                                ? colors.surfaceSecondary
                                : sel
                                  ? colors.primary
                                  : 'transparent',
                            },
                          ]}
                        >
                          {sel && !isDisabled && (
                            <Ionicons name="checkmark" size={12} color={colors.textOnPrimary} />
                          )}
                          {isDisabled && (
                            <Ionicons name="remove" size={12} color={colors.textTertiary} />
                          )}
                        </View>
                      )}
                      {renderLeading?.(item)}
                      <View style={styles.itemContent}>
                        <Text
                          style={[
                            styles.itemLabel,
                            {
                              color: isDisabled
                                ? colors.textTertiary
                                : sel
                                  ? colors.primary
                                  : colors.text,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {label}
                        </Text>
                        {isDisabled ? (
                          <Text
                            style={[styles.itemSublabel, { color: colors.error }]}
                            numberOfLines={1}
                          >
                            {disabledReason}
                          </Text>
                        ) : null}
                        {renderDetails?.(item) ??
                          (!isDisabled && sublabel ? (
                            <Text
                              style={[styles.itemSublabel, { color: colors.textTertiary }]}
                              numberOfLines={1}
                            >
                              {sublabel}
                            </Text>
                          ) : null)}
                      </View>
                      {extra && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e?.stopPropagation?.();
                            onExtraPress?.(item);
                          }}
                          hitSlop={HIT_SLOP}
                        >
                          {extra}
                        </TouchableOpacity>
                      )}
                      {!multi && sel && !isDisabled && (
                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListFooterComponent={
                  loading ? (
                    <ActivityIndicator style={styles.footer} color={colors.primary} />
                  ) : loadError && list.length > 0 ? (
                    <TouchableOpacity
                      style={styles.loadErrorFooter}
                      onPress={() => void load(false, keywordRef.current, true)}
                    >
                      <Ionicons name="refresh-outline" size={16} color={colors.error} />
                      <Text style={[styles.loadErrorText, { color: colors.error }]}>
                        加载失败，点击重试
                      </Text>
                    </TouchableOpacity>
                  ) : null
                }
                ListEmptyComponent={
                  loaded && !loading ? (
                    loadError ? (
                      <EmptyState
                        icon="alert-circle-outline"
                        title="加载失败"
                        description="请检查网络后重试"
                        action={{
                          label: '重试',
                          onPress: () => void load(true, keywordRef.current, true),
                        }}
                      />
                    ) : (
                      <EmptyState compact icon="search-outline" title="无匹配结果" />
                    )
                  ) : null
                }
              />
            </View>
          </View>

          {/* Multi confirm bar */}
          {multi && (
            <View
              style={[
                styles.confirmBar,
                {
                  backgroundColor: colors.surface,
                  borderTopColor: colors.border,
                  paddingBottom: insets.bottom + 8,
                },
              ]}
            >
              <Text style={[styles.selectedCount, { color: colors.textSecondary }]}>
                已选 {selected.length} 项
              </Text>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                onPress={handleConfirm}
              >
                <Text style={[styles.confirmBtnText, { color: colors.textOnPrimary }]}>
                  确认选择
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <BottomSheet
            visible={Boolean(activeQuickFilter)}
            onClose={() => setActiveQuickFilterKey(null)}
            title={activeQuickFilter?.label ?? '筛选'}
            maxHeightRatio={0.72}
          >
            {activeQuickFilter ? (
              <View style={styles.quickFilterOptions}>
                {activeQuickFilter.options.map((option) => {
                  const selectedValue = quickFilterValues[activeQuickFilter.key] ?? '';
                  const selectedOption = option.value === selectedValue;
                  return (
                    <TouchableOpacity
                      key={`${activeQuickFilter.key}-${option.value || 'all'}`}
                      style={[styles.quickFilterOption, { borderBottomColor: colors.borderLight }]}
                      onPress={() => handleQuickFilterChange(activeQuickFilter.key, option.value)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedOption }}
                    >
                      <Text
                        style={[
                          styles.quickFilterOptionLabel,
                          { color: selectedOption ? colors.primary : colors.text },
                        ]}
                      >
                        {option.label}
                      </Text>
                      {selectedOption ? (
                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
                {activeQuickFilter.key === CATEGORY_QUICK_FILTER_KEY && categoryLoading ? (
                  <ActivityIndicator style={styles.categoryFooter} color={colors.primary} />
                ) : null}
                {activeQuickFilter.key === CATEGORY_QUICK_FILTER_KEY && categoryError ? (
                  <TouchableOpacity
                    style={styles.categoryError}
                    onPress={() => void loadCategories()}
                    accessibilityRole="button"
                    accessibilityLabel="重新加载物料分类"
                  >
                    <Ionicons name="refresh-outline" size={16} color={colors.error} />
                    <Text style={[styles.categoryErrorText, { color: colors.error }]}>
                      加载失败，重试
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </BottomSheet>
        </KeyboardAvoidingView>
      </BottomSheetModalProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerAction: {
    width: MIN_TOUCH_TARGET,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.md, fontWeight: '600' },
  headerPlaceholder: { width: MIN_TOUCH_TARGET },
  clearText: { fontSize: FontSize.sm, fontWeight: '500' },
  confirmText: { fontSize: FontSize.sm, fontWeight: '600' },
  searchRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contentRow: { flex: 1 },
  quickFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  quickFilterOptions: { paddingBottom: Spacing.sm },
  quickFilterOption: {
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  quickFilterOptionLabel: { flex: 1, fontSize: FontSize.base },
  categoryFooter: { paddingVertical: Spacing.md },
  categoryError: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  categoryErrorText: { fontSize: FontSize.xs, textAlign: 'center' },
  archivePane: { flex: 1, minWidth: 0 },
  archiveList: { flex: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: { flex: 1 },
  itemLabel: { fontSize: FontSize.base },
  itemSublabel: { fontSize: FontSize.sm, marginTop: 2 },
  footer: { paddingVertical: Spacing.lg },
  loadErrorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  loadErrorText: { fontSize: FontSize.sm },
  confirmBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  selectedCount: { fontSize: FontSize.sm },
  confirmBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  confirmBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
});
