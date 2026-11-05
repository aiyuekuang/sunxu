import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { Notification } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { NOTIFICATION_TYPE_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── 工具函数 ────────────────────────────────────────────────────────────────

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}小时前`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}天前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

type LevelColorFn = (c: { primary: string; warning: string; error: string }) => string;
const LEVEL_COLOR: Record<string, LevelColorFn> = {
  info: (c) => c.primary,
  warning: (c) => c.warning,
  error: (c) => c.error,
};

// ─── 组件 ─────────────────────────────────────────────────────────────────────

export interface NotificationItemProps {
  item: Notification;
  onPress: () => void;
  /** 页面本地已读覆盖（点击后免整页刷新即时去掉未读态） */
  forceRead?: boolean;
}

export const NotificationItem = React.memo(function NotificationItem({
  item,
  onPress,
  forceRead,
}: NotificationItemProps) {
  const { colors } = useTheme();
  // 未知类型显示原始码（图标用 system 兜底），禁止静默伪装成“系统”
  const cfg = NOTIFICATION_TYPE_CONFIG[item.type];
  const icon = cfg?.icon ?? NOTIFICATION_TYPE_CONFIG.system.icon;
  const typeLabel = cfg?.label ?? item.type;
  const isRead = item.isRead || forceRead === true;
  const levelColor = (LEVEL_COLOR[item.level] ?? LEVEL_COLOR.info)(colors);

  return (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor: isRead ? colors.background : colors.surfaceSecondary,
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: isRead ? colors.borderLight : colors.infoLight },
        ]}
      >
        <Ionicons name={icon} size={20} color={levelColor} />
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemTop}>
          <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.itemTime, { color: colors.textMuted }]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
        <Text style={[styles.itemBody, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.content}
        </Text>
        <View style={styles.itemFooter}>
          <Text style={[styles.itemType, { color: colors.textMuted }]}>{typeLabel}</Text>
          {!isRead && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemContent: { flex: 1, gap: 3 },
  itemTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemName: { fontSize: FontSize.sm, fontWeight: '600', flex: 1, marginRight: Spacing.sm },
  itemTime: { fontSize: FontSize.xs, fontWeight: '400' },
  itemBody: { fontSize: FontSize.xs, lineHeight: 16 },
  itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemType: { fontSize: FontSize.xs },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
