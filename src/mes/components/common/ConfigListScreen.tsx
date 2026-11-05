import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type NavigationProp, type ParamListBase, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { getListSortConfig } from '../../constants/list-sort-configs';
import { FontSize, Spacing } from '../../../core/theme/tokens';
import { useListData } from '../../../core/hooks/useListData';
import { useTheme } from '../../../core/theme/useTheme';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { EmptyState } from '../../../core/components/EmptyState.tsx';
import { FAB } from '../../../core/components/FAB.tsx';
import {
  type AdvancedFilterConfig,
  type AdvancedFilterExtraArgs,
  type DateRangeListFilterConfig,
  FILTER_SAVE_FLAG_PREFIX,
  FILTER_TAB_PREFIX,
  FilterBar,
  type FilterBarRef,
  type FilterConfig,
  isDateRange,
  type ListFilterConfig,
  type OptionFilterConfig,
} from '../../../core/components/FilterBar.tsx';
import {
  getDefaultListSort,
  getSortSummary,
  type ListSortOption,
  ListSortSheet,
  type ListSortValue,
} from '../../../core/components/ListSortSheet.tsx';
import { PageHeader } from '../../../core/components/PageHeader.tsx';
import { SearchBar } from '../../../core/components/SearchBar.tsx';
import { StatusTabs, type TabItem } from '../../../core/components/StatusTabs.tsx';

const isOptionFilter = (f: ListFilterConfig): f is OptionFilterConfig =>
  !('type' in f && f.type === 'date_range');

const SORT_STORAGE_PREFIX = 'mes_list_sort_';
const CONTROL_STORAGE_PREFIX = 'mes_list_controls_';

export interface ManagedListControlValues {
  [key: string]: string | undefined;
}

export interface ManagedListControlsHelpers {
  values: ManagedListControlValues;
  setValue: (key: string, value?: string) => void;
  setValues: React.Dispatch<React.SetStateAction<ManagedListControlValues>>;
  filterValues: Record<string, string | undefined>;
  setFilterValues: (values: Record<string, string | undefined>) => void;
}

export interface ManagedListControlsConfig {
  /** 页面自定义控件的默认值（如实体筛选、顶部切换开关） */
  defaults?: ManagedListControlValues;
  /** 参与“记住筛选”的 key；默认取 defaults 的所有 key */
  persistKeys?: string[];
  /** 当默认值存在时，优先使用默认值而不是记忆值（适合下钻路由参数） */
  preferDefaultKeys?: string[];
  /** 将页面自定义控件状态转换为请求参数 */
  toExtraParams?: (values: ManagedListControlValues) => Record<string, unknown>;
  /** 在 PageHeader 右侧渲染自定义控件 */
  renderHeaderRight?: (helpers: ManagedListControlsHelpers) => React.ReactNode;
  /** 在 FilterBar 行内渲染自定义筛选控件 */
  renderFilterExtra?: (helpers: ManagedListControlsHelpers) => React.ReactNode;
  /** 在 tabs 和列表之间渲染依赖控件状态的内容 */
  renderBeforeList?: (helpers: ManagedListControlsHelpers) => React.ReactNode;
}

export interface ConfigListSelectionItemState {
  selected: boolean;
  selectable: boolean;
  toggle: () => void;
}

export interface ConfigListSelectionHelpers<T> {
  selectedKeys: string[];
  selectedItems: T[];
  clear: () => void;
  setSelectedKeys: (keys: string[]) => void;
}

export interface ConfigListSelectionConfig<T> {
  /** 仅业务白名单页面显式开启；ConfigListScreen 不自行推断哪些动作可批量。 */
  enabled: boolean;
  maxSelection?: number;
  isItemSelectable?: (item: T) => boolean;
  onChange?: (helpers: ConfigListSelectionHelpers<T>) => void;
  renderActionBar?: (helpers: ConfigListSelectionHelpers<T>) => React.ReactNode;
}

interface ConfigListScreenProps<T, S extends string = string> {
  // === Header ===
  /** 页面标题 */
  title: string;
  /** 返回按钮（传入后显示 PageHeader） */
  onBack?: () => void;
  /** 右上角自定义内容 */
  headerRight?: React.ReactNode;
  /** 完全自定义 header（替换 PageHeader） */
  renderHeader?: () => React.ReactNode;

  // === Search ===
  searchPlaceholder?: string;
  /** 是否显示搜索框；后端不支持关键字搜索的列表传 false，避免假搜索，默认 true */
  searchable?: boolean;

  // === 统一筛选配置（推荐） ===
  /** 统一筛选配置，每个筛选项声明 placement: 'tab' | 'quick' | 'advanced' */
  filters?: ListFilterConfig[];

  /** 在高级筛选弹层中渲染业务自定义筛选项 */
  advancedFilterExtra?: (args: AdvancedFilterExtraArgs) => React.ReactNode;
  /** 高级筛选自定义项参与应用、记忆和已选数量统计的字段 */
  advancedFilterExtraKeys?: string[];
  /** 高级筛选自定义项中参与已选数量统计的字段 */
  advancedFilterExtraActiveKeys?: string[];

  // === Filters（旧 API，与 filters 互斥） ===
  /** @deprecated 使用 filters 替代 */
  quickFilters?: FilterConfig[];
  /** @deprecated 使用 filters 替代 */
  advancedFilters?: AdvancedFilterConfig[];
  filterStorageKey?: string;
  /** 筛选默认值，如 { balanceStatus: 'outstanding' } */
  defaultFilterValues?: Record<string, string>;
  /** 当默认筛选值存在时，优先使用默认值而不是记忆值（适合 dashboard 下钻到已有筛选项） */
  preferDefaultFilterKeys?: string[];
  /** 对筛选值做转换后再传给 fetchFn */
  transformFilters?: (values: Record<string, unknown>) => Record<string, unknown>;

  // === Tabs（旧 API，与 filters 互斥） ===
  /** @deprecated 使用 filters 替代 */
  statusTabs?: TabItem<S>[];
  /** 传给 fetchFn 的参数名，默认 'status'（使用 filters 时自动推导） */
  statusKey?: string;
  /** tab 是否可滚动（使用 filters 时从配置中读取） */
  tabScrollable?: boolean;
  /** 默认激活的 tab，默认第一个 */
  defaultTab?: S;

  // === Data ===
  fetchFn: (params: Record<string, unknown>) => Promise<{ list: T[]; total: number }>;
  pageSize?: number;
  /** 额外固定参数 */
  extraParams?: Record<string, unknown>;
  /** 页面级控件状态：统一纳入“记住筛选”链路 */
  managedControls?: ManagedListControlsConfig;

  // === Rendering ===
  renderItem: (
    item: T,
    index: number,
    selection?: ConfigListSelectionItemState,
  ) => React.ReactElement;
  keyExtractor?: (item: T) => string;
  /** 当前已加载列表内的受控批量选择；默认关闭，且不会跨筛选保留。 */
  selection?: ConfigListSelectionConfig<T>;
  /** 在 tabs 和列表之间插入自定义内容 */
  renderBeforeList?: () => React.ReactNode;
  /** 在列表内部渲染列表头部，随列表内容一起滚动 */
  renderListHeader?: () => React.ReactNode;
  /** 在 FilterBar 行内末尾渲染额外筛选（如 EntityFilterChip），与快捷筛选同行 */
  renderFilterExtra?: () => React.ReactNode;
  /** 显式指定排序配置 key；不传时默认复用 filterStorageKey */
  sortConfigKey?: string;
  /** 排序持久化 key；不传时默认复用 sortConfigKey / filterStorageKey */
  sortStorageKey?: string;
  /** 覆盖注册表中的排序选项 */
  sortOptions?: ListSortOption[];
  /** 覆盖注册表中的默认排序 */
  defaultSort?: ListSortValue;

  // === Empty State ===
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  emptyText?: string;

  // === FAB ===
  onAdd?: () => void;
  addIcon?: keyof typeof Ionicons.glyphMap;

  // === Options ===
  /** 显示"共 N 条"，默认 true */
  showTotal?: boolean;

  // === Extra UI (modals etc.) ===
  children?: React.ReactNode;

  // === Exposed ref for external control ===
  /** 暴露 loadData 给父组件（用于外部触发刷新） */
  onListDataReady?: (helpers: { loadData: (reset?: boolean) => void }) => void;
  /** 暴露页面级控件状态给父组件（用于外部 modal / 衍生逻辑联动） */
  onManagedControlsChange?: (helpers: ManagedListControlsHelpers) => void;
}

export function ConfigListScreen<T, S extends string = string>({
  title,
  onBack,
  headerRight,
  renderHeader,
  searchPlaceholder = '搜索...',
  searchable = true,
  filters,
  advancedFilterExtra,
  advancedFilterExtraKeys,
  advancedFilterExtraActiveKeys,
  quickFilters: quickFiltersProp,
  advancedFilters: advancedFiltersProp,
  filterStorageKey,
  defaultFilterValues,
  preferDefaultFilterKeys,
  transformFilters,
  statusTabs: statusTabsProp,
  statusKey: statusKeyProp,
  tabScrollable: tabScrollableProp,
  defaultTab,
  fetchFn,
  pageSize = 20,
  extraParams,
  managedControls,
  renderItem,
  keyExtractor = ((item: T & { id?: string }) => item.id ?? '') as (item: T) => string,
  selection,
  renderBeforeList,
  renderListHeader,
  renderFilterExtra,
  sortConfigKey,
  sortStorageKey,
  sortOptions: sortOptionsProp,
  defaultSort: defaultSortProp,
  emptyIcon = 'folder-open-outline',
  emptyText = '暂无数据',
  onAdd,
  addIcon,
  showTotal = true,
  children,
  onListDataReady,
  onManagedControlsChange,
}: ConfigListScreenProps<T, S>) {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const filterBarRef = useRef<FilterBarRef>(null);
  const transformFiltersRef = useRef(transformFilters);
  transformFiltersRef.current = transformFilters;
  const selectionOnChangeRef = useRef(selection?.onChange);
  selectionOnChangeRef.current = selection?.onChange;
  const defaultFilterValuesKey = JSON.stringify(defaultFilterValues ?? {});
  const preferDefaultFilterKeysKey = JSON.stringify(preferDefaultFilterKeys ?? []);
  const resolvedSortConfig = useMemo(
    () => getListSortConfig(sortConfigKey ?? filterStorageKey),
    [sortConfigKey, filterStorageKey],
  );
  const sortOptions = sortOptionsProp ?? resolvedSortConfig?.sortOptions;
  const derivedDefaultSort = useMemo(
    () => defaultSortProp ?? resolvedSortConfig?.defaultSort ?? getDefaultListSort(sortOptions),
    [defaultSortProp, resolvedSortConfig?.defaultSort, sortOptions],
  );
  const effectiveSortStorageKey = sortStorageKey ?? sortConfigKey ?? filterStorageKey;
  const managedControlDefaultsKey = JSON.stringify(managedControls?.defaults ?? {});
  const managedControlPersistKeysKey = JSON.stringify(
    managedControls?.persistKeys ?? Object.keys(managedControls?.defaults ?? {}),
  );
  const managedControlPreferDefaultKeysKey = JSON.stringify(
    managedControls?.preferDefaultKeys ?? [],
  );
  const managedControlDefaults = useMemo(
    () => JSON.parse(managedControlDefaultsKey) as ManagedListControlValues,
    [managedControlDefaultsKey],
  );
  const resolvedDefaultFilterValues = useMemo(
    () => JSON.parse(defaultFilterValuesKey) as Record<string, string>,
    [defaultFilterValuesKey],
  );
  const managedControlPersistKeys = useMemo(
    () => JSON.parse(managedControlPersistKeysKey) as string[],
    [managedControlPersistKeysKey],
  );
  const preferredDefaultFilterKeys = useMemo(
    () => new Set(JSON.parse(preferDefaultFilterKeysKey) as string[]),
    [preferDefaultFilterKeysKey],
  );
  const managedControlPreferDefaultKeys = useMemo(
    () => new Set(JSON.parse(managedControlPreferDefaultKeysKey) as string[]),
    [managedControlPreferDefaultKeysKey],
  );

  // ─── 从 filters 统一配置中拆分出 tabs / quick / advanced ───
  const tabFilterConfig = useMemo(() => {
    if (!filters) return undefined;
    return filters.find((f): f is OptionFilterConfig => isOptionFilter(f) && f.placement === 'tab');
  }, [filters]);

  const statusTabs = useMemo<TabItem<S>[] | undefined>(() => {
    if (statusTabsProp) return statusTabsProp;
    if (!tabFilterConfig) return undefined;
    const tabItems = tabFilterConfig.options.map((o) => ({ key: o.value as S, label: o.label }));
    if (tabFilterConfig.includeAllOption === false) {
      return tabItems;
    }
    return [{ key: 'all' as S, label: '全部' }, ...tabItems];
  }, [statusTabsProp, tabFilterConfig]);

  const statusKey = useMemo(() => {
    if (statusKeyProp) return statusKeyProp;
    return tabFilterConfig?.key ?? 'status';
  }, [statusKeyProp, tabFilterConfig]);

  const tabScrollable =
    tabScrollableProp ?? tabFilterConfig?.scrollable ?? (statusTabs?.length ?? 0) > 4;
  const statusTabsRef = useRef(statusTabs);
  statusTabsRef.current = statusTabs;

  const quickFilters = useMemo<FilterConfig[] | undefined>(() => {
    if (quickFiltersProp) return quickFiltersProp;
    if (!filters) return undefined;
    const items = filters
      .filter((f): f is OptionFilterConfig => isOptionFilter(f) && f.placement === 'quick')
      .map(({ key, label, options }) => ({ key, label, options }));
    return items.length > 0 ? items : undefined;
  }, [quickFiltersProp, filters]);

  const advancedFilters = useMemo<AdvancedFilterConfig[] | undefined>(() => {
    if (advancedFiltersProp) return advancedFiltersProp;
    if (!filters) return undefined;
    const items = filters
      .filter((f) => f.placement === 'advanced')
      .map((f): AdvancedFilterConfig => {
        if ('type' in f && f.type === 'date_range') {
          const dr = f as DateRangeListFilterConfig;
          return {
            type: 'date_range',
            key: dr.key,
            label: dr.label,
            startKey: dr.startKey,
            endKey: dr.endKey,
          };
        }
        const opt = f as OptionFilterConfig;
        return { key: opt.key, label: opt.label, options: opt.options };
      });
    return items.length > 0 ? items : undefined;
  }, [advancedFiltersProp, filters]);

  // DEV 校验
  if (__DEV__ && filters) {
    const tabCount = filters.filter((f) => f.placement === 'tab').length;
    if (tabCount > 1) {
      console.warn('ConfigListScreen: filters 中最多只能有 1 个 placement="tab" 的筛选项');
    }
    const keys = filters.map((f) => f.key);
    const dup = keys.find((k, i) => keys.indexOf(k) !== i);
    if (dup) {
      console.warn(`ConfigListScreen: filters 中存在重复 key: ${dup}`);
    }
  }

  // Filter state
  const [filterValues, setFilterValues] = useState<Record<string, string | undefined>>(
    defaultFilterValues ?? {},
  );
  const [requestFilterValues, setRequestFilterValues] = useState<Record<string, unknown>>(
    defaultFilterValues ?? {},
  );
  const [managedControlValues, setManagedControlValues] =
    useState<ManagedListControlValues>(managedControlDefaults);

  // 记住筛选状态（由 FilterBar 通知）
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [tabHydrated, setTabHydrated] = useState(!filterStorageKey);
  const [filtersHydrated, setFiltersHydrated] = useState(!filterStorageKey);
  const [managedControlsHydrated, setManagedControlsHydrated] = useState(
    !(filterStorageKey && managedControlPersistKeys.length > 0),
  );
  const [sortHydrated, setSortHydrated] = useState(
    !(effectiveSortStorageKey && sortOptions?.length),
  );
  const [sortValue, setSortValue] = useState<ListSortValue | undefined>(derivedDefaultSort);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [selectedKeys, setSelectedKeysState] = useState<string[]>([]);

  // Tab state
  const firstTabKey = (statusTabs?.[0]?.key ?? 'all') as S;
  const [activeTab, setActiveTab] = useState<S>(defaultTab ?? firstTabKey);

  useEffect(() => {
    const hasStorageKey = !!filterStorageKey;
    setTabHydrated(!hasStorageKey);
    setFiltersHydrated(!hasStorageKey);
    setManagedControlsHydrated(!(hasStorageKey && managedControlPersistKeys.length > 0));
  }, [filterStorageKey, managedControlPersistKeys.length]);

  useEffect(() => {
    if (!filterStorageKey || managedControlPersistKeys.length === 0) {
      setManagedControlValues(managedControlDefaults);
      setManagedControlsHydrated(true);
      return;
    }

    let mounted = true;
    setManagedControlsHydrated(false);

    (async () => {
      try {
        const [flag, saved] = await Promise.all([
          AsyncStorage.getItem(FILTER_SAVE_FLAG_PREFIX + filterStorageKey),
          AsyncStorage.getItem(CONTROL_STORAGE_PREFIX + filterStorageKey),
        ]);

        if (!mounted) return;

        if (flag !== '1' || !saved) {
          setManagedControlValues(managedControlDefaults);
          return;
        }

        try {
          const parsed = JSON.parse(saved) as ManagedListControlValues;
          const nextValues: ManagedListControlValues = { ...managedControlDefaults };
          for (const key of managedControlPersistKeys) {
            const savedValue = parsed[key];
            if (savedValue == null) continue;
            if (
              managedControlPreferDefaultKeys.has(key) &&
              managedControlDefaults[key] !== undefined
            ) {
              continue;
            }
            nextValues[key] = savedValue;
          }
          setManagedControlValues(nextValues);
        } catch {
          setManagedControlValues(managedControlDefaults);
        }
      } finally {
        if (mounted) {
          setManagedControlsHydrated(true);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [
    filterStorageKey,
    managedControlDefaults,
    managedControlPersistKeys,
    managedControlPreferDefaultKeys,
  ]);

  useEffect(() => {
    if (!sortOptions?.length) {
      setSortValue(undefined);
      setSortHydrated(true);
      return;
    }

    if (!effectiveSortStorageKey) {
      setSortValue(derivedDefaultSort);
      setSortHydrated(true);
      return;
    }

    let mounted = true;
    setSortHydrated(false);

    (async () => {
      try {
        const saved = await AsyncStorage.getItem(SORT_STORAGE_PREFIX + effectiveSortStorageKey);
        if (!mounted) return;
        if (!saved) {
          setSortValue(derivedDefaultSort);
          return;
        }

        const parsed = JSON.parse(saved) as ListSortValue;
        const matchedOption = sortOptions.find((item) => item.key === parsed.orderBy);
        const directions = matchedOption?.directions ?? ['ASC', 'DESC'];
        const isValidDir = directions.includes(parsed.orderDir);
        setSortValue(
          matchedOption && isValidDir
            ? parsed
            : (derivedDefaultSort ?? getDefaultListSort(sortOptions)),
        );
      } catch {
        if (mounted) {
          setSortValue(derivedDefaultSort);
        }
      } finally {
        if (mounted) {
          setSortHydrated(true);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [derivedDefaultSort, effectiveSortStorageKey, sortOptions]);

  // 响应外部 defaultTab 变化（从 dashboard 下钻时切换 tab）
  useEffect(() => {
    if (defaultTab !== undefined) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // 加载保存的 tab（含失效值验证）
  useEffect(() => {
    if (!filterStorageKey) {
      setTabHydrated(true);
      return;
    }
    (async () => {
      try {
        const [flag, savedTab] = await Promise.all([
          AsyncStorage.getItem(FILTER_SAVE_FLAG_PREFIX + filterStorageKey),
          AsyncStorage.getItem(FILTER_TAB_PREFIX + filterStorageKey),
        ]);
        if (flag === '1' && savedTab && statusTabsRef.current?.some((t) => t.key === savedTab)) {
          setActiveTab(savedTab as S);
        }
      } finally {
        setTabHydrated(true);
      }
    })();
  }, [filterStorageKey]);

  const managedExtraParams = useMemo(
    () => managedControls?.toExtraParams?.(managedControlValues) ?? {},
    [managedControls, managedControlValues],
  );

  const handleFilterChange = useCallback((values: Record<string, string | undefined>) => {
    setFilterValues(values);
    setRequestFilterValues(
      transformFiltersRef.current ? transformFiltersRef.current(values) : values,
    );
  }, []);

  const managedControlHelpers = useMemo<ManagedListControlsHelpers>(
    () => ({
      values: managedControlValues,
      setValue: (key, value) => {
        setManagedControlValues((prev) => ({ ...prev, [key]: value }));
      },
      setValues: setManagedControlValues,
      filterValues,
      setFilterValues: handleFilterChange,
    }),
    [filterValues, handleFilterChange, managedControlValues],
  );

  const storageHydrated = tabHydrated && filtersHydrated && managedControlsHydrated && sortHydrated;

  // Build fetch params
  const buildFetchFn = useCallback(
    (p: Record<string, unknown>) => {
      const tabFilter = statusTabs && activeTab !== ('all' as S) ? { [statusKey]: activeTab } : {};
      const sortParams = sortValue
        ? { orderBy: sortValue.orderBy, orderDir: sortValue.orderDir }
        : {};
      return fetchFn({
        ...p,
        ...sortParams,
        ...tabFilter,
        ...requestFilterValues,
        ...extraParams,
        ...managedExtraParams,
      });
    },
    [
      fetchFn,
      activeTab,
      statusKey,
      statusTabs,
      requestFilterValues,
      extraParams,
      managedExtraParams,
      sortValue,
    ],
  );

  const {
    list,
    total,
    loading,
    refreshing,
    handleSearch,
    keyword,
    onEndReached,
    onRefresh,
    loadData,
  } = useListData<T>({
    fetchFn: buildFetchFn,
    pageSize,
    enabled: storageHydrated,
    focusDeps: [
      activeTab,
      JSON.stringify(requestFilterValues),
      JSON.stringify(extraParams),
      JSON.stringify(managedExtraParams),
      JSON.stringify(sortValue),
    ],
  });

  const selectableItems = useMemo(
    () =>
      selection?.enabled ? list.filter((item) => selection.isItemSelectable?.(item) ?? true) : [],
    [list, selection?.enabled, selection?.isItemSelectable],
  );
  const selectedItems = useMemo(() => {
    const selected = new Set(selectedKeys);
    return list.filter((item) => selected.has(keyExtractor(item)));
  }, [keyExtractor, list, selectedKeys]);
  const setSelectedKeys = useCallback(
    (keys: string[]) => {
      if (!selection?.enabled) {
        setSelectedKeysState([]);
        return;
      }
      const selectableKeySet = new Set(selectableItems.map(keyExtractor));
      const unique = Array.from(new Set(keys)).filter((key) => selectableKeySet.has(key));
      setSelectedKeysState(unique.slice(0, selection.maxSelection ?? Number.POSITIVE_INFINITY));
    },
    [keyExtractor, selectableItems, selection?.enabled, selection?.maxSelection],
  );
  const clearSelection = useCallback(() => setSelectedKeysState([]), []);
  const selectionHelpers = useMemo<ConfigListSelectionHelpers<T>>(
    () => ({ selectedKeys, selectedItems, clear: clearSelection, setSelectedKeys }),
    [clearSelection, selectedItems, selectedKeys, setSelectedKeys],
  );

  useEffect(() => {
    if (!selection?.enabled && selectedKeys.length > 0) {
      setSelectedKeysState([]);
    }
  }, [selectedKeys.length, selection?.enabled]);

  useEffect(() => {
    if (!selection?.enabled || selectedKeys.length === 0) return;
    const selectableKeySet = new Set(selectableItems.map(keyExtractor));
    setSelectedKeysState((current) => {
      const next = current.filter((key) => selectableKeySet.has(key));
      return next.length === current.length ? current : next;
    });
  }, [keyExtractor, selectableItems, selectedKeys.length, selection?.enabled]);

  useEffect(() => {
    selectionOnChangeRef.current?.(selectionHelpers);
  }, [selectionHelpers]);

  const selectionScopeKey = JSON.stringify({
    requestFilterValues,
    extraParams,
    managedExtraParams,
    sortValue,
  });
  const previousSelectionScopeRef = useRef<string | null>(null);

  useEffect(() => {
    // 移动端默认不跨搜索、筛选、排序和分页口径保留勾选，避免用户误处理已离开视野的单据。
    const currentScope = `${String(activeTab)}|${keyword}|${selectionScopeKey}`;
    if (
      previousSelectionScopeRef.current !== null &&
      previousSelectionScopeRef.current !== currentScope
    ) {
      clearSelection();
    }
    previousSelectionScopeRef.current = currentScope;
  }, [activeTab, clearSelection, keyword, selectionScopeKey]);

  // Expose loadData to parent
  React.useEffect(() => {
    onListDataReady?.({ loadData });
  }, [loadData, onListDataReady]);

  React.useEffect(() => {
    onManagedControlsChange?.(managedControlHelpers);
  }, [managedControlHelpers, onManagedControlsChange]);

  const handleTabChange = useCallback(
    (tab: S) => {
      setActiveTab(tab);
      // 持久化 tab 选择
      if (filterStorageKey && saveEnabled) {
        AsyncStorage.setItem(FILTER_TAB_PREFIX + filterStorageKey, tab);
      }
    },
    [filterStorageKey, saveEnabled],
  );

  // 记住筛选开关变化时，同步持久化/清除 tab
  const handleSaveEnabledChange = useCallback(
    (enabled: boolean) => {
      setSaveEnabled(enabled);
      if (!filterStorageKey) return;
      if (enabled) {
        AsyncStorage.setItem(FILTER_TAB_PREFIX + filterStorageKey, activeTab);
      } else {
        AsyncStorage.removeItem(FILTER_TAB_PREFIX + filterStorageKey);
        AsyncStorage.removeItem(CONTROL_STORAGE_PREFIX + filterStorageKey);
      }
    },
    [filterStorageKey, activeTab],
  );

  const handleFiltersHydrated = useCallback(() => {
    setFiltersHydrated(true);
  }, []);

  const handleSortChange = useCallback(
    (nextSort: ListSortValue) => {
      setSortValue(nextSort);
      if (effectiveSortStorageKey) {
        AsyncStorage.setItem(
          SORT_STORAGE_PREFIX + effectiveSortStorageKey,
          JSON.stringify(nextSort),
        );
      }
    },
    [effectiveSortStorageKey],
  );

  useEffect(() => {
    if (!filtersHydrated || preferredDefaultFilterKeys.size === 0) {
      return;
    }

    setFilterValues((prev) => {
      let changed = false;
      const nextValues = { ...prev };

      for (const key of preferredDefaultFilterKeys) {
        const defaultValue = resolvedDefaultFilterValues[key];
        if (defaultValue === undefined) {
          if (nextValues[key] === undefined) {
            continue;
          }
          delete nextValues[key];
          changed = true;
          continue;
        }
        if (nextValues[key] === defaultValue) {
          continue;
        }
        nextValues[key] = defaultValue;
        changed = true;
      }

      if (!changed) {
        return prev;
      }

      setRequestFilterValues(
        transformFiltersRef.current ? transformFiltersRef.current(nextValues) : nextValues,
      );
      return nextValues;
    });
  }, [filtersHydrated, preferredDefaultFilterKeys, resolvedDefaultFilterValues]);

  useEffect(() => {
    if (
      !filterStorageKey ||
      !saveEnabled ||
      !managedControlsHydrated ||
      managedControlPersistKeys.length === 0
    ) {
      return;
    }

    const cleaned: ManagedListControlValues = {};
    for (const key of managedControlPersistKeys) {
      const value = managedControlValues[key];
      if (value) cleaned[key] = value;
    }

    AsyncStorage.setItem(CONTROL_STORAGE_PREFIX + filterStorageKey, JSON.stringify(cleaned));
  }, [
    filterStorageKey,
    managedControlPersistKeys,
    managedControlValues,
    managedControlsHydrated,
    saveEnabled,
  ]);

  const advancedActiveCount = useMemo(() => {
    const filterCount =
      advancedFilters?.filter((f) =>
        isDateRange(f) ? filterValues[f.startKey] || filterValues[f.endKey] : filterValues[f.key],
      ).length ?? 0;
    const extraKeys = advancedFilterExtraActiveKeys ?? advancedFilterExtraKeys ?? [];
    return filterCount + extraKeys.filter((key) => filterValues[key]).length;
  }, [advancedFilterExtraActiveKeys, advancedFilterExtraKeys, advancedFilters, filterValues]);

  const showFilterBar = Boolean(
    (quickFilters?.length ?? 0) > 0 ||
    (advancedFilters?.length ?? 0) > 0 ||
    filterStorageKey ||
    (sortOptions?.length ?? 0) > 0 ||
    renderFilterExtra ||
    managedControls?.renderFilterExtra,
  );
  const hydratingFilters = !storageHydrated;
  const sortSummary = useMemo(
    () => getSortSummary(sortOptions, sortValue),
    [sortOptions, sortValue],
  );
  const sortCustomized = useMemo(() => {
    if (!sortOptions?.length || !sortValue || !derivedDefaultSort) return false;
    return (
      sortValue.orderBy !== derivedDefaultSort.orderBy ||
      sortValue.orderDir !== derivedDefaultSort.orderDir
    );
  }, [derivedDefaultSort, sortOptions, sortValue]);
  const resolvedHeaderRight = useMemo(() => {
    const managedHeaderRight = managedControls?.renderHeaderRight?.(managedControlHelpers);
    if (!managedHeaderRight) return headerRight;
    if (!headerRight) return managedHeaderRight;
    return (
      <View style={styles.headerRightGroup}>
        {headerRight}
        {managedHeaderRight}
      </View>
    );
  }, [managedControls, managedControlHelpers, headerRight]);
  const resolvedFilterExtra = useMemo(() => {
    const managedFilterExtra = managedControls?.renderFilterExtra?.(managedControlHelpers);
    const legacyFilterExtra = renderFilterExtra?.();
    if (!managedFilterExtra) return legacyFilterExtra;
    if (!legacyFilterExtra) return managedFilterExtra;
    return (
      <>
        {legacyFilterExtra}
        {managedFilterExtra}
      </>
    );
  }, [managedControls, managedControlHelpers, renderFilterExtra]);
  const resolvedBeforeList = useMemo(() => {
    const managedBeforeList = managedControls?.renderBeforeList?.(managedControlHelpers);
    const legacyBeforeList = renderBeforeList?.();
    if (!managedBeforeList) return legacyBeforeList;
    if (!legacyBeforeList) return managedBeforeList;
    return (
      <>
        {managedBeforeList}
        {legacyBeforeList}
      </>
    );
  }, [managedControls, managedControlHelpers, renderBeforeList]);
  const selectionActionBar = useMemo(
    () =>
      selection?.enabled && selectedKeys.length > 0
        ? selection.renderActionBar?.(selectionHelpers)
        : null,
    [selectedKeys.length, selection, selectionHelpers],
  );
  const fallbackBackTarget = useMemo(() => {
    let target: NavigationProp<ParamListBase> | undefined = navigation;
    while (target) {
      if (target.canGoBack()) {
        return target;
      }
      target = target.getParent?.();
    }
    return undefined;
  }, [navigation]);
  const resolvedOnBack = useMemo(() => {
    if (onBack) return onBack;
    if (!fallbackBackTarget) return undefined;
    return () => fallbackBackTarget.goBack();
  }, [fallbackBackTarget, onBack]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      {renderHeader ? (
        renderHeader()
      ) : (
        <PageHeader title={title} onBack={resolvedOnBack} right={resolvedHeaderRight} />
      )}

      {/* Search */}
      {searchable && (
        <View style={[styles.searchWrap, { backgroundColor: colors.surface }]}>
          <View style={styles.searchRow}>
            <View style={styles.searchFlex}>
              <SearchBar
                value={keyword}
                onChangeText={handleSearch}
                placeholder={searchPlaceholder}
              />
            </View>
            {/* 有高级筛选 或 有 storageKey（需要访问记住筛选开关）时显示筛选按钮 */}
            {(advancedFilters?.length || filterStorageKey) && (
              <TouchableOpacity
                style={styles.filterIconBtn}
                onPress={() => filterBarRef.current?.openAdvanced()}
                activeOpacity={0.7}
                hitSlop={6}
              >
                <Ionicons
                  name="options-outline"
                  size={18}
                  color={
                    advancedActiveCount > 0 || saveEnabled ? colors.primary : colors.textSecondary
                  }
                />
                {advancedActiveCount > 0 && (
                  <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.filterBadgeText}>{advancedActiveCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Filters — 有筛选配置 或 有 storageKey（记住筛选）时渲染 */}
      {showFilterBar && (
        <FilterBar
          ref={filterBarRef}
          quickFilters={quickFilters ?? []}
          advancedFilters={advancedFilters}
          advancedExtra={advancedFilterExtra}
          advancedExtraKeys={advancedFilterExtraKeys}
          advancedExtraActiveKeys={advancedFilterExtraActiveKeys}
          values={filterValues}
          onChange={handleFilterChange}
          storageKey={filterStorageKey}
          hideAdvancedButton
          leadingControl={
            sortOptions?.length
              ? {
                  label: sortSummary,
                  active: sortCustomized || sortSheetVisible,
                  onPress: () => setSortSheetVisible(true),
                }
              : undefined
          }
          extra={resolvedFilterExtra}
          onSaveEnabledChange={handleSaveEnabledChange}
          onHydrated={handleFiltersHydrated}
        />
      )}

      {/* Status Tabs */}
      {statusTabs && (
        <StatusTabs
          tabs={statusTabs}
          activeKey={activeTab}
          onChange={handleTabChange}
          scrollable={tabScrollable}
        />
      )}

      {/* Before List */}
      {resolvedBeforeList}

      {/* Selection Action Bar */}
      {selectionActionBar}

      {/* List */}
      <FlatList
        data={list}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.listContent, list.length === 0 && styles.listEmpty]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <>
            {showTotal && list.length > 0 ? (
              <Text style={[styles.totalText, { color: colors.textMuted }]}>共 {total} 条</Text>
            ) : null}
            {renderListHeader?.()}
          </>
        }
        ListEmptyComponent={
          hydratingFilters ? (
            <ActivityIndicator color={colors.primary} style={styles.hydratingIndicator} />
          ) : !refreshing && !loading ? (
            <EmptyState
              icon={keyword ? 'search-outline' : emptyIcon}
              title={keyword ? `未找到与"${keyword}"相关的结果` : emptyText}
              description={keyword ? '请尝试其他关键词或清除搜索条件' : undefined}
            />
          ) : null
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
          ) : null
        }
        renderItem={({ item, index }) => {
          if (!selection?.enabled) return renderItem(item, index);
          const key = keyExtractor(item);
          const selectable = selection.isItemSelectable?.(item) ?? true;
          const selected = selectedKeys.includes(key);
          return renderItem(item, index, {
            selected,
            selectable,
            toggle: () => {
              if (!selectable) return;
              setSelectedKeys(
                selected
                  ? selectedKeys.filter((selectedKey) => selectedKey !== key)
                  : [...selectedKeys, key],
              );
            },
          });
        }}
      />

      {/* FAB */}
      {onAdd && <FAB onPress={onAdd} icon={addIcon} />}

      {/* Extra children (modals etc.) */}
      {children}

      {sortOptions?.length ? (
        <ListSortSheet
          visible={sortSheetVisible}
          options={sortOptions}
          value={sortValue}
          onChange={handleSortChange}
          onClose={() => setSortSheetVisible(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  searchFlex: {
    flex: 1,
  },
  filterIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
    paddingBottom: 100,
  },
  listEmpty: {
    flexGrow: 1,
  },
  totalText: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.xs,
  },
  hydratingIndicator: {
    marginTop: Spacing.xl,
  },
});
