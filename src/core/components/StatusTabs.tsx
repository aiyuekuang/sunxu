import { Ionicons } from '@expo/vector-icons';
import {
  ScrollView,
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { FontSize, HIT_SLOP, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText';

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  count?: number;
  /** 可选图标（underline 导航 Tab 常用） */
  icon?: keyof typeof Ionicons.glyphMap;
  /** 置灰不可点击（如权限不足的业务分类） */
  disabled?: boolean;
}

interface StatusTabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  /** 是否可横向滚动（tab 多时用），默认 false 等宽分布 */
  scrollable?: boolean;
  /** 最多显示多少个 tab，超出时自动追加 overflow tab */
  maxVisibleTabs?: number;
  /** overflow tab 文案，默认 "..." */
  overflowLabel?: string;
  /** 点击 overflow tab 回调 */
  onOverflowPress?: () => void;
  /** 超出裁剪时把当前 active tab 提到前面，确保可见 */
  keepActiveVisible?: boolean;
  /** overflow tab 的 key，默认 "__overflow__" */
  overflowKey?: T;
  /** segment=轻量分段；rounded/pill=带轨道的分段条；underline=下划线导航 Tab。 */
  variant?: 'segment' | 'rounded' | 'pill' | 'underline';
  /** 紧凑视觉密度；仅缩小可见控件，触控热区仍由 hitSlop 保持不变 */
  density?: 'default' | 'compact';
  /**
   * 宽度模式：stretch=占满可用宽度等分（默认，页面级分段条）；hug=按内容收缩，
   * 用于嵌入标题行/操作行等自适应宽度容器。stretch 的等分 tab 在自适应宽度容器里
   * 会反向撑满父行、把兄弟元素挤成 0 宽（文字逐字折行成超高但不可见）。
   */
  sizing?: 'stretch' | 'hug';
  /** segment/rounded/pill 变体将 count 显示为徽标；underline 保持内联计数。 */
  countBadge?: boolean;
  /** 容器自定义样式（用于调整间距等） */
  style?: StyleProp<ViewStyle>;
}

export function StatusTabs<T extends string = string>({
  tabs,
  activeKey,
  onChange,
  scrollable = false,
  maxVisibleTabs,
  overflowLabel = '...',
  onOverflowPress,
  keepActiveVisible = false,
  overflowKey,
  variant = 'rounded',
  density = 'default',
  sizing = 'stretch',
  countBadge = false,
  style: containerStyle,
}: StatusTabsProps<T>) {
  const { colors } = useTheme();
  const resolvedOverflowKey = (overflowKey ?? ('__overflow__' as T)) as T;
  const hasOverflow = !!maxVisibleTabs && maxVisibleTabs > 0 && tabs.length > maxVisibleTabs;

  const displayTabs = (() => {
    if (!hasOverflow || !maxVisibleTabs || maxVisibleTabs <= 0) {
      return tabs;
    }

    const sourceTabs = keepActiveVisible
      ? (() => {
          const activeTab = tabs.find((tab) => tab.key === activeKey);
          if (!activeTab) return tabs;
          return [activeTab, ...tabs.filter((tab) => tab.key !== activeTab.key)];
        })()
      : tabs;

    return [
      ...sourceTabs.slice(0, maxVisibleTabs),
      { key: resolvedOverflowKey, label: overflowLabel } satisfies TabItem<T>,
    ];
  })();

  const handleTabPress = (key: T) => {
    if (hasOverflow && key === resolvedOverflowKey) {
      onOverflowPress?.();
      return;
    }
    onChange(key);
  };

  if (variant === 'underline') {
    const renderUnderlineTabs = () =>
      displayTabs.map((tab) => {
        const active = tab.key === activeKey;
        const isOverflowTab = hasOverflow && tab.key === resolvedOverflowKey;
        const tabColor = tab.disabled
          ? colors.textMuted
          : active
            ? colors.primary
            : colors.textSecondary;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.underlineTab, !scrollable && sizing !== 'hug' && styles.tabFlex]}
            onPress={() => {
              if (!tab.disabled) handleTabPress(tab.key);
            }}
            activeOpacity={tab.disabled ? 1 : 0.7}
            hitSlop={HIT_SLOP}
            disabled={tab.disabled}
            accessibilityRole={isOverflowTab ? 'button' : 'tab'}
            accessibilityState={
              isOverflowTab
                ? { disabled: tab.disabled }
                : { selected: active, disabled: tab.disabled }
            }
            aria-selected={isOverflowTab ? undefined : active}
            accessibilityLabel={
              isOverflowTab
                ? `${tab.label}，更多选项`
                : `${tab.label}${tab.count != null ? `，${tab.count}` : ''}`
            }
          >
            {tab.icon ? <Ionicons name={tab.icon} size={16} color={tabColor} /> : null}
            <Text
              style={[
                styles.underlineTabText,
                { color: tabColor },
                active && { fontWeight: '600' },
              ]}
            >
              {tab.label}
              {tab.count != null && tab.count > 0 ? ` (${tab.count})` : ''}
            </Text>
            {active && (
              <View style={[styles.underlineIndicator, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        );
      });

    if (scrollable) {
      return (
        <View
          style={[styles.underlineWrapper, { borderBottomColor: colors.border }, containerStyle]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            alwaysBounceHorizontal={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderUnderlineTabs()}
          </ScrollView>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.underlineWrapper,
          styles.row,
          { borderBottomColor: colors.border },
          containerStyle,
        ]}
      >
        {renderUnderlineTabs()}
      </View>
    );
  }

  const isCompact = density === 'compact';

  const renderTabs = () =>
    displayTabs.map((tab) => {
      const active = tab.key === activeKey;
      const isOverflowTab = hasOverflow && tab.key === resolvedOverflowKey;
      return (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            { borderRadius: Radius.sm },
            isCompact && styles.tabCompact,
            !scrollable && sizing !== 'hug' && styles.tabFlex,
            active
              ? {
                  backgroundColor: tab.disabled
                    ? colors.surfaceSecondary
                    : colors.primary,
                }
              : null,
            tab.disabled && styles.tabDisabled,
          ]}
          onPress={() => handleTabPress(tab.key)}
          activeOpacity={tab.disabled ? 1 : 0.7}
          hitSlop={HIT_SLOP}
          disabled={tab.disabled}
          accessibilityRole={isOverflowTab ? 'button' : 'tab'}
          accessibilityState={
            isOverflowTab
              ? { disabled: tab.disabled }
              : { selected: active, disabled: tab.disabled }
          }
          aria-selected={isOverflowTab ? undefined : active}
          accessibilityLabel={
            isOverflowTab
              ? `${tab.label}，更多选项`
              : `${tab.label}${tab.count != null ? `，${tab.count}` : ''}`
          }
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                {
                  color: tab.disabled
                    ? colors.textMuted
                    : active
                      ? colors.textOnPrimary
                      : colors.textSecondary,
                },
                active && { fontWeight: '600' },
              ]}
            >
              {tab.label}
              {!countBadge && tab.count != null && tab.count > 0
                ? ` (${tab.count})`
                : ''}
            </Text>
            {countBadge && tab.count != null ? (
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor:
                      tab.disabled || !active
                        ? colors.surfaceSecondary
                        : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    {
                      color: tab.disabled
                        ? colors.textMuted
                        : active
                          ? colors.primary
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    });

  if (variant === 'segment') {
    if (scrollable) {
      return (
        <View style={[styles.wrapper, isCompact && styles.wrapperCompact, containerStyle]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            alwaysBounceHorizontal={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderTabs()}
          </ScrollView>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.wrapper,
          isCompact && styles.wrapperCompact,
          styles.row,
          containerStyle,
        ]}
      >
        {renderTabs()}
      </View>
    );
  }

  if (scrollable) {
    return (
      <View
        style={[
          styles.wrapper,
          isCompact && styles.wrapperCompact,
          { backgroundColor: colors.surface },
          containerStyle,
        ]}
      >
        <View style={[styles.track, { backgroundColor: colors.background }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            alwaysBounceHorizontal={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderTabs()}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        isCompact && styles.wrapperCompact,
        styles.row,
        { backgroundColor: colors.surface },
        containerStyle,
      ]}
    >
      <View
        style={[
          styles.track,
          sizing === 'stretch' && styles.trackStretch,
          { backgroundColor: colors.background },
        ]}
      >
        {renderTabs()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: Spacing.xs,
  },
  wrapperCompact: {
    paddingVertical: 0,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
  },
  scrollContent: {
    paddingLeft: 0,
    paddingRight: Spacing.xl,
    gap: Spacing.xs,
  },
  /** 分段轨道：一条连续灰轨承载所有 tab，未选中段透明，避免“白底上漂浮灰块”的割裂感 */
  track: {
    flexDirection: 'row',
    borderRadius: Radius.sm,
    padding: 2,
    gap: Spacing.xs,
  },
  trackStretch: {
    flex: 1,
    minWidth: 0,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: FontSize.xs,
    lineHeight: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tabCompact: {
    minHeight: 32,
    paddingHorizontal: Spacing.sm,
  },
  tabFlex: {
    flex: 1,
  },
  tabDisabled: {
    opacity: 0.5,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  // ─── Underline variant ──────────────────────────────────────────────────────
  underlineWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  underlineTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    position: 'relative',
  },
  underlineTabText: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  underlineIndicator: {
    position: 'absolute',
    bottom: 0,
    left: Spacing.sm,
    right: Spacing.sm,
    height: 2,
    borderRadius: 1,
  },
});
