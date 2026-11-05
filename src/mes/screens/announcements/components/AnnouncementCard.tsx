import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Announcement } from '../../../host/services';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import {
  ANNOUNCEMENT_PRIORITY_CONFIG,
  ANNOUNCEMENT_STATUS_CONFIG,
} from '../../../constants/status-configs';
import { Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatShortDateTime } from '../../../../core/utils/date';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AnnouncementCardProps {
  item: Announcement;
  onPress: () => void;
  /** 管理员视角：显示状态标签 */
  showStatus?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const AnnouncementCard = React.memo(function AnnouncementCard({
  item,
  onPress,
  showStatus,
}: AnnouncementCardProps) {
  const { colors } = useTheme();

  const authorName = item.author?.realName ?? item.author?.username;
  const timeStr = formatShortDateTime(item.publishAt ?? item.createdAt);
  const showPriority = item.priority !== 'normal';

  return (
    <ListCard onPress={onPress}>
      <ListCard.Header>
        <View style={styles.titleRow}>
          {!item.isRead && item.status === 'published' && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          )}
          {item.isPinned && (
            <Ionicons name="pin" size={14} color={colors.warning} style={styles.pinIcon} />
          )}
          <ListCard.Code color={colors.text}>{item.title}</ListCard.Code>
        </View>
        <View style={styles.badges}>
          {showStatus && (
            <ConfigBadge value={item.status} config={ANNOUNCEMENT_STATUS_CONFIG} size="sm" />
          )}
          {showPriority && (
            <ConfigBadge value={item.priority} config={ANNOUNCEMENT_PRIORITY_CONFIG} size="sm" />
          )}
        </View>
      </ListCard.Header>
      <ListCard.Meta>
        {authorName ? <ListCard.MetaText>{authorName}</ListCard.MetaText> : null}
        <ListCard.MetaText>{timeStr}</ListCard.MetaText>
      </ListCard.Meta>
    </ListCard>
  );
});

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexShrink: 0,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  pinIcon: {
    flexShrink: 0,
  },
});
