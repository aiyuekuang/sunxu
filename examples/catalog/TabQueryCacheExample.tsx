import { useMemo, useRef, useState } from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AppText,
  StatusTabs,
  type TabItem,
  useTheme,
} from 'sunxu';
import {
  createTabQueryFamily,
  invalidateTabQueryFamily,
  useTabInfiniteQuery,
} from 'sunxu/query';

type CacheTab = 'all' | 'answered' | 'unanswered';
type CacheDemoPage = { tab: CacheTab; revision: number; page: number };

const cacheDemoTabs: TabItem<CacheTab>[] = [
  { key: 'all', label: '全部' },
  { key: 'answered', label: '已接通' },
  { key: 'unanswered', label: '未接通' },
];

const cacheDemoLabels: Record<CacheTab, string> = {
  all: '全部通话',
  answered: '已接通号码',
  unanswered: '未接通号码',
};

export function TabQueryCacheExample() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CacheTab>('all');
  const [visibleRevision, setVisibleRevision] = useState(1);
  const revisionRef = useRef(1);
  const queryFamily = useMemo(
    () =>
      createTabQueryFamily({
        resourceKey: 'catalog-call-records',
        scope: { principalId: 'catalog-user', tenantId: 'catalog-company' },
      }),
    [],
  );
  const filters = useMemo(() => ({ dateRange: 'last-7-days' }), []);
  const query = useTabInfiniteQuery<
    CacheDemoPage,
    Error,
    InfiniteData<CacheDemoPage>,
    number
  >({
    queryFamily,
    tabKey: activeTab,
    filters,
    initialPageParam: 1,
    staleTime: 60_000,
    gcTime: 120_000,
    queryFn: async ({ queryKey, pageParam }) => {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return {
        tab: queryKey[5] as CacheTab,
        revision: revisionRef.current,
        page: pageParam,
      };
    },
    getNextPageParam: () => undefined,
  });

  const updateDemoData = () => {
    revisionRef.current += 1;
    setVisibleRevision(revisionRef.current);
    void invalidateTabQueryFamily(queryClient, queryFamily, {
      discardInactive: true,
    });
  };
  const currentPage = query.data?.pages[0];

  return (
    <View style={styles.section} testID="demo-tab-query-cache">
      <AppText style={[styles.title, { color: colors.text }]}>Tab 查询缓存 · 按页签隔离</AppText>
      <StatusTabs tabs={cacheDemoTabs} activeKey={activeTab} onChange={setActiveTab} variant="underline" />
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <AppText style={{ color: colors.text }}>
          {query.isPending
            ? '首次读取中…'
            : `${cacheDemoLabels[currentPage?.tab ?? activeTab]} · 数据版本 ${currentPage?.revision ?? visibleRevision}`}
        </AppText>
        <AppText style={{ color: colors.textSecondary }}>
          {query.isFetching ? '正在后台更新' : '切换页签可恢复各自缓存'}
        </AppText>
        {query.error ? (
          <AppText style={{ color: colors.error }}>更新失败，缓存仍可见；可点下方按钮重试。</AppText>
        ) : null}
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={updateDemoData}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <AppText style={[styles.buttonText, { color: colors.textOnPrimary }]}>模拟话单更新</AppText>
          </Pressable>
          {query.error ? (
            <Pressable accessibilityRole="button" onPress={() => void query.refetch()} style={styles.button}>
              <AppText style={styles.buttonText}>重试</AppText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  title: { fontSize: 14, fontWeight: '600' },
  card: { gap: 8, padding: 12, borderWidth: 1, borderRadius: 10 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  button: { minHeight: 44, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  buttonText: { fontWeight: '600' },
});
