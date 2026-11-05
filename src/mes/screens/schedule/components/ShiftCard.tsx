import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { ShiftCalendar } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { Badge } from '../../../../core/components/Badge.tsx';
import { WEEKDAY_LABELS } from '../../../constants/status-configs';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShiftCardProps {
  item: ShiftCalendar;
  onHistory?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ShiftCard = React.memo(function ShiftCard({
  item,
  onHistory,
  onEdit,
  onDelete,
}: ShiftCardProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.shiftName, { color: colors.text }]}>{item.name}</Text>
        <Badge
          label={item.isActive ? '启用' : '停用'}
          variant={item.isActive ? 'success' : 'default'}
          size="sm"
        />
      </View>
      <Text style={[styles.shiftTime, { color: colors.primary }]}>
        {item.startTime} — {item.endTime}
        {item.crossDay ? '（次日）' : ''}
      </Text>
      {(item.breaks as Array<{ startTime: string; endTime: string }> | undefined)?.length ? (
        <Text style={[styles.shiftBreaks, { color: colors.textTertiary }]}>
          休息:{' '}
          {(item.breaks as Array<{ startTime: string; endTime: string }>)
            .map((b) => `${b.startTime}-${b.endTime}`)
            .join('、')}
        </Text>
      ) : null}
      <Text style={[styles.shiftDays, { color: colors.textSecondary }]}>
        工作日: {item.workingDays.map((d) => WEEKDAY_LABELS[Number(d)]).join('、')}
      </Text>
      {(onHistory || onEdit || onDelete) && (
        <View style={styles.shiftActions}>
          {onHistory && (
            <TouchableOpacity onPress={onHistory} style={styles.shiftActionBtn}>
              <Text style={[styles.shiftActionText, { color: colors.textSecondary }]}>
                变更记录
              </Text>
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.shiftActionBtn}>
              <Text style={[styles.shiftActionText, { color: colors.primary }]}>编辑</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.shiftActionBtn}>
              <Text style={[styles.shiftActionText, { color: colors.error }]}>删除</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs, ...Shadow.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shiftName: { fontSize: FontSize.base, fontWeight: '600' },
  shiftTime: { fontSize: FontSize.sm, fontWeight: '500' },
  shiftBreaks: { fontSize: FontSize.xs },
  shiftDays: { fontSize: FontSize.xs },
  shiftActions: { flexDirection: 'row', gap: Spacing.xs, marginTop: 2, justifyContent: 'flex-end' },
  shiftActionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  shiftActionText: { fontSize: FontSize.xs, fontWeight: '600' },
});
