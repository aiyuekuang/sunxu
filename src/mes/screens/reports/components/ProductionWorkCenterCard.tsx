import { Pressable, StyleSheet, View } from 'react-native';
import type { WorkCenterProductivityItemDto } from '../../../types/models/WorkCenterProductivityItemDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { ProgressBar } from '../../../../core/components/ProgressBar.tsx';
import { FontSize, MIN_TOUCH_TARGET, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatCompactNumber, formatNumber } from '../../../../core/utils/format';
import { ReportSectionHeader } from './ReportSectionHeader.tsx';

interface ProductionWorkCenterCardProps {
  dateFrom: string;
  dateTo: string;
  items: WorkCenterProductivityItemDto[];
  onOpenWorkCenter: (workCenterId: string, workCenterName: string) => void;
}

function clampPercent(value: number): number {
  return Math.min(Math.max(Number(value) || 0, 0), 100);
}

function WorkCenterRow({
  item,
  onPress,
}: {
  item: WorkCenterProductivityItemDto;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const progress = clampPercent(item.completionRate);
  const hasOverdue = Number(item.overdue) > 0;
  const barColor = hasOverdue ? colors.warning : colors.success;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`查看${item.workCenterName}工作中心工单`}
      accessibilityHint="打开按该工作中心过滤的工单列表"
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {item.workCenterName}
        </Text>
        <Text style={[styles.rate, { color: barColor }]}>{formatNumber(progress)}%</Text>
      </View>
      <ProgressBar
        current={progress}
        target={100}
        height={Spacing.xs}
        // 有计划超时用警示色、无超时用成功色，语义色由业务态决定
        activeColor={barColor}
        completedColor={barColor}
      />
      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          完工 {formatCompactNumber(item.completed)} / 总计 {formatCompactNumber(item.total)}
        </Text>
        <Text
          style={[styles.metaText, { color: hasOverdue ? colors.error : colors.textSecondary }]}
        >
          {hasOverdue ? `计划超时 ${formatCompactNumber(item.overdue)}` : '无计划超时'}
        </Text>
      </View>
    </Pressable>
  );
}

export function ProductionWorkCenterCard({
  dateFrom,
  dateTo,
  items,
  onOpenWorkCenter,
}: ProductionWorkCenterCardProps) {
  const { colors } = useTheme();

  return (
    <>
      <ReportSectionHeader
        title="工作中心瓶颈"
        hint={`${dateFrom} 至 ${dateTo} · 共 ${items.length} 个`}
      />
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {items.length > 0 ? (
          items.map((item) => (
            <WorkCenterRow
              key={item.workCenterId}
              item={item}
              onPress={() => onOpenWorkCenter(item.workCenterId, item.workCenterName)}
            />
          ))
        ) : (
          <EmptyState compact icon="business-outline" title="当前范围暂无工作中心数据" />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    ...Shadow.sm,
  },
  row: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: { flex: 1, fontSize: FontSize.sm, fontWeight: '600' },
  rate: { fontSize: FontSize.sm, fontWeight: '700' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  metaText: { fontSize: FontSize.xs },
  pressed: { opacity: 0.72 },
});
