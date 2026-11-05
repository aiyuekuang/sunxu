import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  type PieceworkSummary,
  type PieceworkSummaryItem,
  pieceworkService,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { InlineLoading, LoadingView } from '../../../../core/components/LoadingView.tsx';
import { FontSize, Shadow, Spacing } from '../../../../core/theme/tokens';
import { usePermission } from '../../../host/hooks/usePermission';
import { P } from '../../../host/authorization';
import { useTheme } from '../../../../core/theme/useTheme';
import type { RootStackParamList } from '../../../host/navigation';
import { toast } from '../../../../core/toast';
import { PieceworkSummaryCard } from './PieceworkSummaryCard.tsx';
import type { ReportDateRange } from './ReportContextBar.tsx';
import { ReportPeriodHero } from './ReportPeriodHero.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PieceworkTabProps {
  /** Mask function to hide/show amounts */
  mask: (text: string) => string;
  dateRange: ReportDateRange;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PieceworkTab({ mask, dateRange }: PieceworkTabProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [list, setList] = useState<PieceworkSummaryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<PieceworkSummary>({
    inProgressItemCount: 0,
    settledItemCount: 0,
    unsettledItemCount: 0,
    wageItemCount: 0,
    totalQty: 0,
    totalScrappedQty: 0,
    totalTimeHours: 0,
    totalTimeMinutes: 0,
    totalWage: 0,
    pendingWageCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const canViewAll = usePermission(P.PIECEWORK_VIEW_ALL);
  const startDate = dateRange.startDate;
  const endDate = dateRange.endDate;

  const PAGE_SIZE = 20;

  const loadData = useCallback(
    async (p = 1) => {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await pieceworkService.getSummary({
          startDate,
          endDate,
          page: p,
          pageSize: PAGE_SIZE,
        });
        if (p === 1) {
          setList(res.list);
          setSummary(res.summary);
        } else {
          setList((prev) => [...prev, ...res.list]);
        }
        setTotal(res.total);
        setPage(p);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '加载失败';
        toast.error(msg);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [startDate, endDate],
  );

  useEffect(() => {
    void loadData(1);
  }, [loadData]);

  const handleItemPress = useCallback(
    (item: PieceworkSummaryItem) => {
      navigation.navigate('PieceworkDetail', {
        assigneeId: item.assigneeId,
        assigneeName: item.assigneeName || '未知',
        startDate,
        endDate,
      });
    },
    [navigation, startDate, endDate],
  );

  const renderItem = useCallback(
    ({ item }: { item: PieceworkSummaryItem }) => {
      return <PieceworkSummaryCard item={item} mask={mask} onPress={() => handleItemPress(item)} />;
    },
    [mask, handleItemPress],
  );

  return (
    <View style={styles.container}>
      {list.length > 0 ? (
        <View style={[styles.filterBar, { backgroundColor: colors.surface }]}>
          <View style={[styles.summaryRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.summaryItem, { color: colors.textSecondary }]}>
              {canViewAll ? `共 ${total} 人` : '我的工资'}
              {summary.totalTimeHours > 0 ? ` · 计时 ${summary.totalTimeHours.toFixed(2)} h` : ''}
              {summary.pendingWageCount > 0 ? ` · 待确认 ${summary.pendingWageCount}` : ''}
            </Text>
            <Text style={[styles.summaryTotal, { color: colors.primary }]}>
              合计 {mask(`¥${summary.totalWage.toFixed(2)}`)}
            </Text>
          </View>
        </View>
      ) : null}

      {loading ? (
        <LoadingView />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(i) => i.assigneeId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="cash-outline"
              title="暂无数据"
              description="该周期内没有生产工资记录，请确认已设置工序单价并完成报工"
            />
          }
          onEndReached={() => {
            if (list.length < total && !loadingMore) loadData(page + 1);
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <InlineLoading /> : null}
          ListHeaderComponent={
            <ReportPeriodHero
              label="计件工资合计"
              value={mask(`¥${summary.totalWage.toFixed(2)}`)}
              hint={`${dateRange.startDate} 至 ${dateRange.endDate} · ${canViewAll ? `共 ${total} 人` : '仅显示本人'}`}
              icon="cash-outline"
              tone="primary"
            />
          }
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterBar: { padding: Spacing.sm, gap: Spacing.sm, marginBottom: Spacing.xs, ...Shadow.sm },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 0.5,
  },
  summaryItem: { fontSize: FontSize.sm },
  summaryTotal: { fontSize: FontSize.md, fontWeight: '700' },
  listContent: { padding: Spacing.sm, gap: Spacing.sm },
});
