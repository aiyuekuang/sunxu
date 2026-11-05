import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { WorkOrderDetail } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityTimelineProps {
  order: WorkOrderDetail;
  materialUnit: string;
}

interface ActivityItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  detail?: string;
  time: Date;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActivityTimeline({ order, materialUnit }: ActivityTimelineProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const activities = useMemo(() => {
    const items: ActivityItem[] = [];

    // 工单创建
    items.push({
      id: 'created',
      icon: 'add-circle-outline',
      iconColor: colors.primary,
      title: '工单创建',
      detail: order.orderNo,
      time: new Date(order.createdAt),
    });

    // 实际开始
    if (order.actualStartTime) {
      items.push({
        id: 'started',
        icon: 'play-circle-outline',
        iconColor: colors.success,
        title: '工单开工',
        time: new Date(order.actualStartTime),
      });
    }

    // 实际完成
    if (order.actualEndTime) {
      items.push({
        id: 'completed',
        icon: 'checkmark-circle-outline',
        iconColor: colors.success,
        title: '工单完工',
        detail: `良品 ${Number(order.completedQty)} / 投产 ${Number(order.plannedQty)} ${materialUnit}`,
        time: new Date(order.actualEndTime),
      });
    }

    // 结案
    if (order.closedAt) {
      items.push({
        id: 'closed',
        icon: 'lock-closed-outline',
        iconColor: colors.textSecondary,
        title: '工单结案',
        detail: order.closer?.realName ? `操作人：${order.closer.realName}` : undefined,
        time: new Date(order.closedAt),
      });
    }

    // 按时间倒序
    items.sort((a, b) => b.time.getTime() - a.time.getTime());
    return items;
  }, [order, colors, materialUnit]);

  if (activities.length <= 1) return null;

  const displayItems = expanded ? activities : activities.slice(0, 5);
  const hasMore = activities.length > 5;

  const formatTime = (d: Date) => {
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${h}:${m}`;
  };

  return (
    <DetailCard title="操作记录" noPadding>
      <View style={styles.list}>
        {displayItems.map((item, idx) => {
          const isLast = idx === displayItems.length - 1;
          return (
            <View key={item.id} style={styles.row}>
              <View style={styles.iconCol}>
                <Ionicons name={item.icon} size={18} color={item.iconColor} />
                {!isLast && <View style={[styles.line, { backgroundColor: colors.border }]} />}
              </View>
              <View style={[styles.contentCol, !isLast && styles.contentPadded]}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.time, { color: colors.textTertiary }]}>
                    {formatTime(item.time)}
                  </Text>
                </View>
                {item.detail && (
                  <Text style={[styles.detail, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.detail}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
        {hasMore && (
          <TouchableOpacity style={styles.moreBtn} onPress={() => setExpanded((v) => !v)}>
            <Text style={[styles.moreText, { color: colors.primary }]}>
              {expanded ? '收起' : `查看全部 ${activities.length} 条`}
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
  row: { flexDirection: 'row' },
  iconCol: { width: 24, alignItems: 'center' },
  line: { width: 1.5, flex: 1, marginVertical: 2 },
  contentCol: { flex: 1, marginLeft: Spacing.sm },
  contentPadded: { paddingBottom: Spacing.md },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: { fontSize: FontSize.sm, fontWeight: '500', flex: 1 },
  time: { fontSize: FontSize.xs },
  detail: { fontSize: FontSize.xs, marginTop: 2 },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  moreText: { fontSize: FontSize.xs, fontWeight: '500' },
});
