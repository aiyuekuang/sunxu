import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import type { AlertEventItemDto } from '../../../types/models/AlertEventItemDto';
import type { NameQtyItemDto } from '../../../types/models/NameQtyItemDto';
import type { DashboardLargeScreen, RealtimeDashboard } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime, formatTime } from '../../../../core/utils/date';
import { formatCompactNumber, formatNumber } from '../../../../core/utils/format';
import { ReportDonutChart } from './ReportDonutChart.tsx';

function clampPercent(value: number): number {
  return Math.min(Math.max(Number(value) || 0, 0), 100);
}

function eventTone(level: string, colors: ReturnType<typeof useTheme>['colors']): string {
  const normalized = level.toLowerCase();
  if (
    normalized.includes('critical') ||
    normalized.includes('high') ||
    normalized.includes('error') ||
    normalized.includes('严重')
  ) {
    return colors.error;
  }
  if (
    normalized.includes('warning') ||
    normalized.includes('medium') ||
    normalized.includes('警')
  ) {
    return colors.warning;
  }
  return colors.primary;
}

interface DashboardLiveProductionCardProps {
  largeScreen: DashboardLargeScreen;
  realtime: RealtimeDashboard;
}

interface WorkerActivity {
  worker: string;
  operation: string;
  orderNo: string;
  materialName?: string;
  latestTime?: string;
  goodQty: number;
  defectQty: number;
  durationHours: number;
  taskCount: number;
}

function buildWorkerActivities(
  reports: DashboardLargeScreen['realtimeReports'],
  tasks: DashboardLargeScreen['taskProgress'],
): WorkerActivity[] {
  const activities = new Map<string, WorkerActivity>();
  reports.forEach((report) => {
    const worker = report.worker?.trim() || '未识别人员';
    if (activities.has(worker)) return;
    activities.set(worker, {
      worker,
      operation: report.operationName || '直接报工',
      orderNo: report.orderNo,
      materialName: report.materialName,
      latestTime: report.time,
      goodQty: 0,
      defectQty: 0,
      durationHours: 0,
      taskCount: 0,
    });
  });
  tasks.forEach((task) => {
    const worker = task.worker?.trim() || '未识别人员';
    const activity = activities.get(worker) ?? {
      worker,
      operation: task.operationName || '直接报工',
      orderNo: task.orderNo,
      materialName: task.materialName,
      goodQty: 0,
      defectQty: 0,
      durationHours: 0,
      taskCount: 0,
    };
    activity.goodQty += Number(task.goodQty ?? 0);
    activity.defectQty += Number(task.defectQty ?? 0);
    activity.durationHours += Number(task.durationHours ?? 0);
    activity.taskCount += 1;
    activities.set(worker, activity);
  });
  return Array.from(activities.values());
}

function LiveStat({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.liveStat}>
      <Text style={[styles.liveStatValue, { color: tone }]}>{value}</Text>
      <Text style={[styles.liveStatLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function WorkerActivityRow({ activity }: { activity: WorkerActivity }) {
  const { colors } = useTheme();
  const efficiency = activity.durationHours > 0 ? activity.goodQty / activity.durationHours : 0;
  return (
    <View style={[styles.workerActivityRow, { borderBottomColor: colors.borderLight }]}>
      <View style={[styles.workerAvatar, { backgroundColor: colors.primarySurface }]}>
        <Ionicons name="person-outline" size={17} color={colors.primary} />
      </View>
      <View style={styles.workerActivityBody}>
        <View style={styles.workerActivityHeader}>
          <Text style={[styles.workerName, { color: colors.text }]} numberOfLines={1}>
            {activity.worker}
          </Text>
          {activity.latestTime ? (
            <Text style={[styles.workerTime, { color: colors.textSecondary }]}>
              最近 {formatTime(activity.latestTime)}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.workerTask, { color: colors.text }]} numberOfLines={1}>
          {activity.operation} · {activity.orderNo}
        </Text>
        <Text style={[styles.workerMeta, { color: colors.textSecondary }]} numberOfLines={1}>
          {activity.materialName ?? '未指定物料'} · 今日良品 {formatCompactNumber(activity.goodQty)}{' '}
          件
          {activity.defectQty > 0 ? ` · 不合格 ${formatCompactNumber(activity.defectQty)} 件` : ''}
          {activity.durationHours > 0
            ? ' · ' +
              formatNumber(activity.durationHours) +
              'h / ' +
              formatNumber(efficiency) +
              ' 件/时'
            : ''}
        </Text>
      </View>
    </View>
  );
}

export function DashboardLiveProductionCard({
  largeScreen,
  realtime,
}: DashboardLiveProductionCardProps) {
  const { colors } = useTheme();
  const equipmentIssues = realtime.equipmentStatus.fault + realtime.equipmentStatus.maintenance;
  const workerActivities = buildWorkerActivities(
    largeScreen.realtimeReports,
    largeScreen.taskProgress,
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.liveStatsGrid}>
        <LiveStat label="在制工单" value={realtime.workOrders.running} tone={colors.primary} />
        <LiveStat label="待开工" value={realtime.workOrders.pending} tone={colors.warning} />
        <LiveStat label="暂停" value={realtime.workOrders.paused} tone={colors.error} />
        <LiveStat label="今日报工" value={largeScreen.todayReportCount} tone={colors.success} />
        <LiveStat
          label="作业人员"
          value={largeScreen.todayReportWorkerCount}
          tone={colors.primary}
        />
        <LiveStat
          label="累计工时"
          value={`${formatNumber(largeScreen.todayTotalHours)}h`}
          tone={colors.text}
        />
        <LiveStat
          label="今日产量"
          value={formatCompactNumber(largeScreen.todayOutputQty)}
          tone={colors.success}
        />
        <LiveStat
          label="设备异常"
          value={equipmentIssues}
          tone={equipmentIssues > 0 ? colors.error : colors.success}
        />
      </View>

      <View style={[styles.liveDivider, { backgroundColor: colors.borderLight }]} />

      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>人员 / 工序作业</Text>
          <Text style={[styles.cardHint, { color: colors.textSecondary }]}>
            每人显示最近作业与今日累计
          </Text>
        </View>
        <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
      </View>
      {workerActivities.length > 0 ? (
        workerActivities.map((activity) => (
          <WorkerActivityRow key={activity.worker} activity={activity} />
        ))
      ) : (
        <EmptyState compact icon="people-outline" title="今天还没有人员作业记录" />
      )}
    </View>
  );
}

interface DashboardQualityMixCardProps {
  totalPass: number;
  totalFail: number;
  passRate: number;
  onPress: () => void;
}

export function DashboardQualityMixCard({
  totalPass,
  totalFail,
  passRate,
  onPress,
}: DashboardQualityMixCardProps) {
  const { colors } = useTheme();
  const total = Number(totalPass ?? 0) + Number(totalFail ?? 0);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="查看质量合格与不合格统计"
    >
      {total > 0 ? (
        <ReportDonutChart
          items={[
            { id: 'pass', label: '合格', value: totalPass, color: colors.success },
            { id: 'fail', label: '不合格', value: totalFail, color: colors.error },
          ]}
          centerLabel="合格率"
          centerValue={`${formatNumber(passRate)}%`}
          accessibilityLabel={`质量合格 ${formatCompactNumber(totalPass)}，不合格 ${formatCompactNumber(totalFail)}，综合合格率 ${formatNumber(passRate)}%`}
        />
      ) : (
        <EmptyState compact icon="shield-checkmark-outline" title="暂无有效检验样本" />
      )}
    </Pressable>
  );
}

interface DashboardDefectDistributionCardProps {
  items: NameQtyItemDto[];
  onPress: () => void;
}

export function DashboardDefectDistributionCard({
  items,
  onPress,
}: DashboardDefectDistributionCardProps) {
  const { colors } = useTheme();
  const topItems = items.slice(0, 5);
  const total = topItems.reduce((sum, item) => sum + Number(item.qty ?? 0), 0);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {topItems.length === 0 || total <= 0 ? (
        <EmptyState compact icon="checkmark-done-outline" title="暂无缺陷记录" />
      ) : (
        topItems.map((item, index) => {
          const percent = (Number(item.qty) / total) * 100;
          return (
            <Pressable
              key={`${item.name}-${item.qty}`}
              style={({ pressed }) => [
                styles.defectRow,
                { borderBottomColor: colors.borderLight },
                pressed && styles.pressed,
              ]}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={`查看缺陷${item.name}`}
            >
              <Text style={[styles.rank, { color: colors.textSecondary }]}>{index + 1}</Text>
              <View style={styles.defectBody}>
                <View style={styles.defectHeader}>
                  <Text style={[styles.defectName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.defectQty, { color: colors.error }]}>
                    {formatCompactNumber(item.qty)}
                  </Text>
                </View>
                <View style={[styles.defectTrack, { backgroundColor: colors.borderLight }]}>
                  <View
                    style={[
                      styles.defectFill,
                      {
                        width: `${clampPercent(percent)}%`,
                        backgroundColor: colors.error,
                      },
                    ]}
                  />
                </View>
              </View>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

interface DashboardAttentionCardProps {
  overdue: number;
  pendingInspections: number;
  lowStock: number;
  onOverdue?: () => void;
  onQuality: () => void;
  onStock?: () => void;
}

function AttentionRow({
  icon,
  label,
  value,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.attentionRow,
        { borderBottomColor: colors.borderLight },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      hitSlop={HIT_SLOP}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label} ${value}`}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
    >
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.attentionLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.attentionValue, { color }]}>{formatCompactNumber(value)}</Text>
      {onPress ? <Ionicons name="chevron-forward" size={15} color={colors.textTertiary} /> : null}
    </Pressable>
  );
}

export function DashboardAttentionCard({
  overdue,
  pendingInspections,
  lowStock,
  onOverdue,
  onQuality,
  onStock,
}: DashboardAttentionCardProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.attentionCard, { backgroundColor: colors.surface }]}>
      <AttentionRow
        icon="warning-outline"
        label="交期逾期工单"
        value={overdue}
        color={overdue > 0 ? colors.error : colors.success}
        onPress={onOverdue}
      />
      <AttentionRow
        icon="shield-checkmark-outline"
        label="待处理质检"
        value={pendingInspections}
        color={pendingInspections > 0 ? colors.warning : colors.success}
        onPress={onQuality}
      />
      <AttentionRow
        icon="cube-outline"
        label="低库存预警"
        value={lowStock}
        color={lowStock > 0 ? colors.error : colors.success}
        onPress={onStock}
      />
    </View>
  );
}

export function DashboardAlertEventCard({ events }: { events: AlertEventItemDto[] }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>最新异常事件</Text>
          <Text style={[styles.cardHint, { color: colors.textSecondary }]}>
            严重优先，同级按时间倒序
          </Text>
        </View>
        <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
      </View>
      {events.slice(0, 5).map((event) => (
        <View
          key={`${event.time}-${event.title}`}
          style={[styles.eventRow, { borderBottomColor: colors.borderLight }]}
        >
          <View style={[styles.eventDot, { backgroundColor: eventTone(event.level, colors) }]} />
          <View style={styles.eventBody}>
            <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
              {event.title}
            </Text>
            <Text style={[styles.eventMeta, { color: colors.textSecondary }]}>
              {event.source} · {formatDateTime(event.time)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm, ...Shadow.sm },
  liveStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.md,
    columnGap: Spacing.sm,
  },
  liveStat: { width: '23%', minWidth: 64, gap: Spacing.xs },
  liveStatValue: { fontSize: FontSize.lg, fontWeight: '700' },
  liveStatLabel: { fontSize: FontSize.xs },
  liveDivider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.xs },
  workerActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  workerAvatar: {
    width: MIN_TOUCH_TARGET - Spacing.xl,
    height: MIN_TOUCH_TARGET - Spacing.xl,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerActivityBody: { flex: 1, minWidth: 0, gap: Spacing.xs },
  workerActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  workerName: { flex: 1, fontSize: FontSize.sm, fontWeight: '700' },
  workerTime: { fontSize: FontSize.xs },
  workerTask: { fontSize: FontSize.sm, fontWeight: '600' },
  workerMeta: { fontSize: FontSize.xs },
  defectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rank: { width: Spacing.lg, fontSize: FontSize.sm, fontWeight: '700' },
  defectBody: { flex: 1, gap: Spacing.xs },
  defectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  defectName: { flex: 1, fontSize: FontSize.sm, fontWeight: '600' },
  defectQty: { fontSize: FontSize.xs, fontWeight: '700' },
  defectTrack: { height: Spacing.xs, borderRadius: Radius.full, overflow: 'hidden' },
  defectFill: { height: Spacing.xs, borderRadius: Radius.full },
  attentionCard: { borderRadius: Radius.md, paddingHorizontal: Spacing.md, ...Shadow.sm },
  attentionRow: {
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  attentionLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: '600' },
  attentionValue: { fontSize: FontSize.md, fontWeight: '700' },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  cardTitle: { fontSize: FontSize.base, fontWeight: '700' },
  cardHint: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  eventDot: { width: 8, height: 8, borderRadius: Radius.full, marginTop: Spacing.xs },
  eventBody: { flex: 1, gap: Spacing.xs },
  eventTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  eventMeta: { fontSize: FontSize.xs },
  pressed: { opacity: 0.72 },
});
