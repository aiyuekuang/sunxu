import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { EquipmentSession } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { MACHINE_SESSION_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatShortDateTime } from '../../../../core/utils/date';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MachineSessionHistoryCardProps {
  item: EquipmentSession;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MachineSessionHistoryCard = React.memo(function MachineSessionHistoryCard({
  item,
}: MachineSessionHistoryCardProps) {
  const { colors } = useTheme();

  const scCfg = MACHINE_SESSION_STATUS_CONFIG[item.status];
  const sc = scCfg
    ? { label: scCfg.label, color: colors[scCfg.themeColor] }
    : { label: '未知状态', color: colors.textMuted };

  const startTime = formatShortDateTime(item.startedAt);
  const endTime = item.endedAt
    ? new Date(item.endedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    : null;
  const durationText =
    item.actualDuration != null
      ? `${Math.floor(item.actualDuration / 60)}h${String(Math.round(item.actualDuration % 60)).padStart(2, '0')}m`
      : '-';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={[styles.operator, { color: colors.text }]} numberOfLines={1}>
            {item.operator?.realName ?? item.operator?.username ?? '未知操作员'}
          </Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {startTime}
            {endTime ? ` → ${endTime}` : ' → 上机中'}
          </Text>
          {item.shiftCalendar && (
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              班次：{item.shiftCalendar.name}（{item.shiftCalendar.startTime}–
              {item.shiftCalendar.endTime}）
            </Text>
          )}
          {item.workOrder && (
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              工单：{item.workOrder.orderNo}
            </Text>
          )}
        </View>
        <View style={styles.right}>
          <View style={[styles.badge, { backgroundColor: `${sc.color}20` }]}>
            <Text style={[styles.badgeText, { color: sc.color }]}>{sc.label}</Text>
          </View>
          <Text style={[styles.duration, { color: colors.textSecondary }]}>{durationText}</Text>
        </View>
      </View>
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: { borderRadius: Radius.md, padding: Spacing.sm, ...Shadow.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  left: { flex: 1, gap: 3 },
  right: { alignItems: 'flex-end', gap: Spacing.xs },
  operator: { fontSize: FontSize.sm, fontWeight: '500' },
  time: { fontSize: FontSize.xs },
  sub: { fontSize: FontSize.xs },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  duration: { fontSize: FontSize.xs },
});
