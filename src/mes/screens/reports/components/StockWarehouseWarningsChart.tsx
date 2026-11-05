import { Pressable, StyleSheet, View } from 'react-native';
import type { StockWarningSummaryDto } from '../../../types/models/StockWarningSummaryDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { FontSize, MIN_TOUCH_TARGET, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatCompactNumber } from '../../../../core/utils/format';
import { ReportSectionHeader } from './ReportSectionHeader.tsx';

interface StockWarehouseWarningsChartProps {
  summaries: StockWarningSummaryDto[];
  onOpenWarehouse: (warehouseId?: string, warehouseName?: string) => void;
}

interface WarehouseWarningCount {
  id: string;
  name: string;
  count: number;
}

export function StockWarehouseWarningsChart({
  summaries,
  onOpenWarehouse,
}: StockWarehouseWarningsChartProps) {
  const { colors } = useTheme();
  const groups = new Map<string, WarehouseWarningCount>();
  summaries.forEach((summary) => {
    const id = summary.warehouseId ?? 'unassigned';
    const name = summary.warehouse?.name ?? '未指定仓库';
    const group = groups.get(id) ?? { id, name, count: 0 };
    group.count += 1;
    groups.set(id, group);
  });
  const rows = Array.from(groups.values())
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, 5);
  const maxCount = Math.max(...rows.map((item) => item.count), 1);

  if (summaries.length === 0) return null;

  return (
    <>
      <ReportSectionHeader title="预警仓库排行" hint="按预警物料数统计 · 前 5 个仓库" />
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {rows.length > 0 ? (
          rows.map((item) => {
            const percentage = Math.min((item.count / maxCount) * 100, 100);
            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() =>
                  onOpenWarehouse(item.id === 'unassigned' ? undefined : item.id, item.name)
                }
                accessibilityRole="button"
                accessibilityLabel={`${item.name}，${item.count} 个物料预警`}
                accessibilityHint="打开该仓库的库存预警台账"
              >
                <View style={styles.header}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.count, { color: colors.error }]}>
                    {formatCompactNumber(item.count)} 个
                  </Text>
                </View>
                <View style={[styles.track, { backgroundColor: colors.borderLight }]}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${percentage}%`, backgroundColor: colors.error },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })
        ) : (
          <EmptyState compact icon="cube-outline" title="暂无仓库预警数据" />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.md, padding: Spacing.sm, gap: Spacing.xs, ...Shadow.sm },
  row: { minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', gap: Spacing.xs },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: { flex: 1, fontSize: FontSize.sm, fontWeight: '600' },
  count: { fontSize: FontSize.xs, fontWeight: '700' },
  track: { height: Spacing.xs, borderRadius: Radius.full, overflow: 'hidden' },
  fill: { height: Spacing.xs, borderRadius: Radius.full },
  pressed: { opacity: 0.72 },
});
