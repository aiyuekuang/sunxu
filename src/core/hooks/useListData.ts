import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

interface PaginatedResult<T> {
  list: T[];
  total: number;
}

interface UseListDataOptions<T, P extends Record<string, unknown>> {
  fetchFn: (params: P & { page: number; pageSize: number }) => Promise<PaginatedResult<T>>;
  pageSize?: number;
  debounceMs?: number;
  params?: Partial<P>;
  focusDeps?: unknown[];
  enabled?: boolean;
}

interface UseListDataReturn<T> {
  list: T[];
  total: number;
  loading: boolean;
  refreshing: boolean;
  loadData: (reset?: boolean) => void;
  handleSearch: (text: string) => void;
  keyword: string;
  setKeyword: (text: string) => void;
  onEndReached: () => void;
  onRefresh: () => void;
  hasMore: boolean;
}

export function useListData<T, P extends Record<string, unknown> = Record<string, unknown>>(
  options: UseListDataOptions<T, P>,
): UseListDataReturn<T> {
  const { fetchFn, pageSize = 20, debounceMs = 400, params, focusDeps, enabled = true } = options;
  const [list, setList] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [_page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [keyword, setKeyword] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const keywordRef = useRef(keyword);
  keywordRef.current = keyword;
  const hasLoadedOnce = useRef(false);
  const skipNextFocus = useRef(true);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const requestIdRef = useRef(0);

  const loadData = useCallback(
    async (reset = false, silent = false) => {
      if (!enabledRef.current || (loadingRef.current && !reset)) return;
      const nextPage = reset ? 1 : pageRef.current + 1;
      if (!reset && !hasMoreRef.current) return;
      const requestId = ++requestIdRef.current;
      loadingRef.current = true;
      if (!silent) reset ? setRefreshing(true) : setLoading(true);
      try {
        const result = await fetchFnRef.current({
          page: nextPage,
          pageSize,
          keyword: keywordRef.current || undefined,
          ...paramsRef.current,
        } as unknown as P & { page: number; pageSize: number });
        if (requestId !== requestIdRef.current) return;
        setList((previous) => (reset ? result.list : [...previous, ...result.list]));
        setTotal(result.total);
        setPage(nextPage);
        pageRef.current = nextPage;
        const more = result.list.length === pageSize;
        setHasMore(more);
        hasMoreRef.current = more;
      } catch (error: unknown) {
        if (requestId !== requestIdRef.current) return;
        if (axios.isCancel(error) || (error instanceof Error && error.message === 'canceled')) return;
        setHasMore(false);
        hasMoreRef.current = false;
      } finally {
        if (requestId === requestIdRef.current) {
          if (!silent) {
            setRefreshing(false);
            setLoading(false);
          }
          loadingRef.current = false;
        }
      }
    },
    [pageSize],
  );

  const handleSearch = useCallback(
    (text: string) => {
      setKeyword(text);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        pageRef.current = 0;
        hasMoreRef.current = true;
        void loadData(true);
      }, debounceMs);
    },
    [debounceMs, loadData],
  );
  const onEndReached = useCallback(() => void loadData(false), [loadData]);
  const onRefresh = useCallback(() => void loadData(true), [loadData]);
  const stableFocusDeps = focusDeps ?? [];

  useEffect(() => {
    if (!enabled) return;
    pageRef.current = 0;
    hasMoreRef.current = true;
    void loadData(true);
    hasLoadedOnce.current = true;
    skipNextFocus.current = true;
  }, [enabled, loadData, ...stableFocusDeps]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled || skipNextFocus.current) {
        skipNextFocus.current = false;
        return;
      }
      if (hasLoadedOnce.current) {
        pageRef.current = 0;
        hasMoreRef.current = true;
        void loadData(true, true);
      }
    }, [enabled, loadData]),
  );

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    requestIdRef.current += 1;
  }, []);

  return {
    list,
    total,
    loading,
    refreshing,
    loadData: (reset = false) => void loadData(reset),
    handleSearch,
    keyword,
    setKeyword,
    onEndReached,
    onRefresh,
    hasMore,
  };
}
