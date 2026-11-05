import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import type { HomeStatKey, HomeStats } from '../../../constants/home-configs';
import { HOME_STAT_CONFIG } from '../../../constants/home-configs';
import {
  FontSize,
  MIN_TOUCH_TARGET_ANDROID,
  NotificationBadgeDimensions,
  Spacing,
} from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { getGreeting } from '../../../utils/greeting';
import { StatCard } from './StatCard.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HomeHeaderSectionProps {
  /** 首页标题旁显示的用户名称。 */
  displayName: string;
  /** 首页今日生产数据。 */
  stats: HomeStats;
  /** 是否有权限查看生产摘要。 */
  showStats: boolean;
  /** 是否有权限进入通知中心。 */
  canAccessNotifications: boolean;
  /** 当前系统通知未读数量。 */
  unreadCount: number;
  /** 打开首页功能编辑。 */
  onEditHome: () => void;
  /** 打开通知中心。 */
  onOpenNotifications: () => void;
  /** 返回对应指标可用的下钻操作。 */
  onPressStat: (key: HomeStatKey) => (() => void) | undefined;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeHeaderSection({
  displayName,
  stats,
  showStats,
  canAccessNotifications,
  unreadCount,
  onEditHome,
  onOpenNotifications,
  onPressStat,
}: HomeHeaderSectionProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const greeting = getGreeting();
  const bellUnread = canAccessNotifications ? unreadCount : 0;
  const bellBadgeLabel = bellUnread > 99 ? '99+' : String(bellUnread);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.md,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={[styles.headerContent, showStats && styles.headerContentWithStats]}>
        <View style={styles.headerText}>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            工作台
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            accessibilityLabel={`${greeting}，${displayName}`}
            style={[styles.greeting, { color: colors.textSecondary }]}
          >
            {greeting}，{displayName}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={onEditHome}
            accessibilityRole="button"
            accessibilityLabel="编辑首页功能"
          >
            <Ionicons
              accessible={false}
              name="apps-outline"
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {canAccessNotifications ? (
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={onOpenNotifications}
              accessibilityRole="button"
              accessibilityLabel={bellUnread > 0 ? `打开通知，${bellUnread} 条未读` : '打开通知'}
            >
              <Ionicons
                accessible={false}
                name="notifications-outline"
                size={23}
                color={colors.textSecondary}
              />
              {bellUnread > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text
                    accessible={false}
                    numberOfLines={1}
                    allowFontScaling={false}
                    style={[styles.badgeText, { color: colors.textOnPrimary }]}
                  >
                    {bellBadgeLabel}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {showStats ? (
        <View style={styles.statsGrid}>
          {HOME_STAT_CONFIG.map((cfg, index) => (
            <View key={cfg.key} style={styles.statItemWrap}>
              <StatCard cfg={cfg} value={stats[cfg.key]} onPress={onPressStat(cfg.key)} />
              {index < HOME_STAT_CONFIG.length - 1 ? (
                <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    gap: Spacing.sm,
  },
  headerContentWithStats: {
    paddingBottom: Spacing.xs,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
  },
  greeting: {
    fontSize: FontSize.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconButton: {
    width: MIN_TOUCH_TARGET_ANDROID,
    height: MIN_TOUCH_TARGET_ANDROID,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    minWidth: NotificationBadgeDimensions.diameter,
    height: NotificationBadgeDimensions.diameter,
    paddingHorizontal: NotificationBadgeDimensions.horizontalPadding,
    borderRadius: NotificationBadgeDimensions.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: NotificationBadgeDimensions.fontSize,
    lineHeight: NotificationBadgeDimensions.lineHeight,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
  },
  statItemWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
  },
});
