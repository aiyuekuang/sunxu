import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { SearchBar } from '../../../../core/components/SearchBar.tsx';
import { SelectableChip } from '../../../../core/components/SelectableChip.tsx';
import {
  type ActionGroup,
  DEFAULT_FAVORITE_ACTION_KEYS,
  HOME_FAVORITE_ACTION_LIMIT,
} from '../../../constants/home-configs';
import {
  FontSize,
  HIT_SLOP,
  MIN_TOUCH_TARGET,
  MIN_TOUCH_TARGET_ANDROID,
  Radius,
  Spacing,
} from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useMenuLayoutStore } from '../../../host/state/menu-layout.store';
import { toast } from '../../../../core/toast';

type QuickActionItem = ActionGroup['items'][number];
type FlatQuickActionItem = QuickActionItem & { groupTitle: string };

export interface QuickMenuGridProps {
  groups: ActionGroup[];
  hasNoPermissions: boolean;
  onNavigate: (screen: string, params?: Record<string, unknown>) => void;
}

function matchesKeyword(action: FlatQuickActionItem, keyword: string): boolean {
  if (!keyword) return true;
  return `${action.label} ${action.groupTitle}`.toLowerCase().includes(keyword);
}

function sortFavoriteActions(
  actions: FlatQuickActionItem[],
  preferredKeys: readonly string[],
): FlatQuickActionItem[] {
  const preferredIndex = new Map<string, number>(preferredKeys.map((key, index) => [key, index]));

  return [...actions].sort((a, b) => {
    const aIndex = preferredIndex.get(a.key) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = preferredIndex.get(b.key) ?? Number.MAX_SAFE_INTEGER;
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    return 0;
  });
}

function resolveFavoriteActions(
  actions: FlatQuickActionItem[],
  favoriteItemKeys: string[],
): FlatQuickActionItem[] {
  const actionMap = new Map(actions.map((action) => [action.key, action]));
  const pinnedActions = favoriteItemKeys
    .map((key) => actionMap.get(key))
    .filter((action): action is FlatQuickActionItem => Boolean(action));
  const pinnedKeys = new Set(pinnedActions.map((action) => action.key));
  const fallbackActions = sortFavoriteActions(
    actions.filter((action) => !pinnedKeys.has(action.key)),
    DEFAULT_FAVORITE_ACTION_KEYS,
  );

  return [...pinnedActions, ...fallbackActions].slice(0, HOME_FAVORITE_ACTION_LIMIT);
}

function cloneNavigationParamValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(cloneNavigationParamValue);
  }

  if (value !== null && typeof value === 'object') {
    return cloneNavigationParams(value as Record<string, unknown>);
  }

  return value;
}

function cloneNavigationParams(
  params?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!params) return undefined;

  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, cloneNavigationParamValue(value)]),
  );
}

export function QuickMenuGrid({ groups, hasNoPermissions, onNavigate }: QuickMenuGridProps) {
  const { colors } = useTheme();
  const { favoriteItemKeys, menuDisplayMode, toggleFavoriteItem } = useMenuLayoutStore();
  const isFocused = useIsFocused();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetGroupFilter, setSheetGroupFilter] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [editMode, setEditMode] = useState(false);
  const reopenSheetOnFocusRef = useRef(false);

  const flatActions = useMemo<FlatQuickActionItem[]>(
    () =>
      groups.flatMap((group) =>
        group.items.map((item) => ({
          ...item,
          groupTitle: group.title,
        })),
      ),
    [groups],
  );

  const favoriteActions = useMemo(
    () => resolveFavoriteActions(flatActions, favoriteItemKeys),
    [favoriteItemKeys, flatActions],
  );

  const visibleFavoriteKeys = useMemo(
    () => favoriteItemKeys.filter((key) => flatActions.some((item) => item.key === key)),
    [favoriteItemKeys, flatActions],
  );

  const filteredSheetGroups = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const baseGroups =
      sheetGroupFilter === 'all'
        ? groups
        : groups.filter((group) => group.title === sheetGroupFilter);

    return baseGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          matchesKeyword({ ...item, groupTitle: group.title }, normalizedKeyword),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, keyword, sheetGroupFilter]);

  const hasSearchResults = filteredSheetGroups.length > 0;

  const openAllFunctions = () => {
    setSheetGroupFilter('all');
    setKeyword('');
    setEditMode(false);
    setSheetVisible(true);
  };

  const handleNavigate = (action: QuickActionItem) => {
    reopenSheetOnFocusRef.current = sheetVisible;
    setSheetVisible(false);
    setEditMode(false);
    onNavigate(action.screen, cloneNavigationParams(action.params));
  };

  useEffect(() => {
    if (!isFocused || !reopenSheetOnFocusRef.current) return;
    reopenSheetOnFocusRef.current = false;
    setSheetVisible(true);
  }, [isFocused]);

  const handleTogglePin = (actionKey: string, pinned: boolean) => {
    if (!pinned && visibleFavoriteKeys.length >= HOME_FAVORITE_ACTION_LIMIT) {
      toast.info(`最多置顶 ${HOME_FAVORITE_ACTION_LIMIT} 个常用功能`);
      return;
    }
    toggleFavoriteItem(actionKey);
  };

  if (hasNoPermissions) {
    return (
      <View
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
      >
        <EmptyState
          icon="grid-outline"
          title="暂无可展示功能"
          description="可在工作台设置里调整功能入口显示"
        />
      </View>
    );
  }

  if (menuDisplayMode === 'expanded') {
    return (
      <>
        {groups.map((group) => (
          <View
            key={group.title}
            style={[
              styles.groupCard,
              { backgroundColor: colors.surface, borderColor: colors.borderLight },
            ]}
          >
            <View style={styles.groupHeader}>
              <Text style={[styles.groupTitle, { color: colors.text }]}>{group.title}</Text>
              <Text style={[styles.groupMeta, { color: colors.textMuted }]}>
                {`${group.items.length} 项`}
              </Text>
            </View>
            <View style={styles.groupGrid}>
              {group.items.map((action) => (
                <QuickActionButton
                  key={`${group.title}-${action.key}`}
                  action={action}
                  textColor={colors.textSecondary}
                  onPress={() => handleNavigate(action)}
                />
              ))}
            </View>
          </View>
        ))}
      </>
    );
  }

  return (
    <>
      <View
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>常用功能</Text>
          <TouchableOpacity
            style={styles.allBtn}
            activeOpacity={0.72}
            hitSlop={HIT_SLOP}
            onPress={openAllFunctions}
            accessibilityRole="button"
            accessibilityLabel="打开全部功能"
          >
            <Ionicons accessible={false} name="apps-outline" size={21} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.favoriteGrid}>
          {favoriteActions.map((action) => (
            <QuickActionButton
              key={action.key}
              action={action}
              textColor={colors.textSecondary}
              variant={favoriteActions.length === 1 ? 'row' : 'tile'}
              onPress={() => handleNavigate(action)}
            />
          ))}
        </View>
      </View>

      <BottomSheet
        visible={sheetVisible}
        onClose={() => {
          setEditMode(false);
          setSheetVisible(false);
        }}
        title="全部功能"
        subtitle={
          editMode
            ? `点击菜单右上角图钉，最多置顶 ${HOME_FAVORITE_ACTION_LIMIT} 个`
            : sheetGroupFilter === 'all'
              ? '按模块浏览并搜索功能入口'
              : `当前模块：${sheetGroupFilter}`
        }
        maxHeightRatio={0.88}
      >
        <View style={styles.sheetToolbar}>
          <View style={styles.sheetSearchWrap}>
            <SearchBar value={keyword} onChangeText={setKeyword} placeholder="搜索功能" />
          </View>
          <TouchableOpacity
            style={[
              styles.editBtn,
              {
                backgroundColor: 'transparent',
                borderColor: editMode ? `${colors.primary}2E` : colors.borderLight,
              },
            ]}
            activeOpacity={0.72}
            hitSlop={HIT_SLOP}
            onPress={() => setEditMode((value) => !value)}
          >
            <Ionicons
              name={editMode ? 'checkmark-outline' : 'pin-outline'}
              size={14}
              color={editMode ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.editBtnText,
                { color: editMode ? colors.primary : colors.textSecondary },
              ]}
            >
              {editMode ? '结束编辑' : '置顶编辑'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sheetFilterRow}>
          <SelectableChip
            label="全部"
            selected={sheetGroupFilter === 'all'}
            onPress={() => setSheetGroupFilter('all')}
          />
          {groups.map((group) => (
            <SelectableChip
              key={group.title}
              label={group.title}
              selected={sheetGroupFilter === group.title}
              onPress={() => setSheetGroupFilter(group.title)}
            />
          ))}
        </View>

        {editMode && (
          <Text style={[styles.editHint, { color: colors.textMuted }]}>
            置顶后的功能会出现在首页精简模式，全部展开模式不受影响。
          </Text>
        )}

        {!hasSearchResults && (
          <View style={styles.emptyWrap}>
            <EmptyState
              compact
              icon="search-outline"
              title="未找到匹配功能"
              description="换个关键词试试，或切换模块筛选"
            />
          </View>
        )}

        {filteredSheetGroups.map((group) => (
          <View key={`sheet-${group.title}`} style={styles.sheetSection}>
            <View style={styles.sheetSectionHeader}>
              <Text style={[styles.sheetSectionTitle, { color: colors.text }]}>{group.title}</Text>
              <Text style={[styles.sheetSectionMeta, { color: colors.textMuted }]}>
                {`${group.items.length} 项`}
              </Text>
            </View>
            <View style={styles.sheetGrid}>
              {group.items.map((action) => {
                const pinned = visibleFavoriteKeys.includes(action.key);
                return (
                  <QuickActionButton
                    key={`sheet-${group.title}-${action.key}`}
                    action={action}
                    textColor={colors.textSecondary}
                    onPress={() => handleNavigate(action)}
                    editMode={editMode}
                    pinned={pinned}
                    pinDisabled={
                      !pinned && visibleFavoriteKeys.length >= HOME_FAVORITE_ACTION_LIMIT
                    }
                    onTogglePin={() => handleTogglePin(action.key, pinned)}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </BottomSheet>
    </>
  );
}

interface QuickActionButtonProps {
  action: QuickActionItem;
  textColor: string;
  onPress: () => void;
  variant?: 'tile' | 'row';
  editMode?: boolean;
  pinned?: boolean;
  pinDisabled?: boolean;
  onTogglePin?: () => void;
}

function QuickActionButton({
  action,
  textColor,
  onPress,
  variant = 'tile',
  editMode = false,
  pinned = false,
  pinDisabled = false,
  onTogglePin,
}: QuickActionButtonProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.quickItem, variant === 'row' && styles.quickItemRow]}>
      {editMode && onTogglePin && (
        <TouchableOpacity
          style={[
            styles.pinBtn,
            {
              backgroundColor: colors.surface,
              borderColor: pinned ? `${colors.primary}2E` : colors.borderLight,
              opacity: pinDisabled ? 0.5 : 1,
            },
          ]}
          activeOpacity={0.72}
          hitSlop={HIT_SLOP}
          onPress={onTogglePin}
        >
          <Ionicons
            name={pinned ? 'pin' : 'pin-outline'}
            size={12}
            color={pinned ? colors.primary : pinDisabled ? colors.textMuted : colors.textSecondary}
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        activeOpacity={editMode ? 1 : 0.7}
        onPress={editMode ? undefined : onPress}
        style={[styles.quickTapArea, variant === 'row' && styles.quickTapAreaRow]}
        accessibilityRole="button"
        accessibilityLabel={editMode ? `${action.label}置顶设置` : `打开${action.label}`}
      >
        <View
          style={[
            styles.quickIconBox,
            variant === 'row' && styles.quickIconBoxRow,
            {
              backgroundColor: isDark ? `${action.color}18` : action.bg,
            },
          ]}
        >
          <Ionicons accessible={false} name={action.icon} size={20} color={action.color} />
        </View>
        <Text
          style={[
            styles.quickLabel,
            variant === 'row' && styles.quickLabelRow,
            { color: textColor },
          ]}
          numberOfLines={2}
        >
          {action.label}
        </Text>
        {variant === 'row' && (
          <Ionicons accessible={false} name="chevron-forward" size={18} color={colors.textMuted} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const MENU_CARD_VERTICAL_PADDING = (Spacing.xs + Spacing.sm) / 2;
const QUICK_ITEM_MIN_HEIGHT = MIN_TOUCH_TARGET + Spacing.xl + Spacing.xs;

const styles = StyleSheet.create({
  card: {
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: MENU_CARD_VERTICAL_PADDING,
    paddingHorizontal: Spacing.md,
    paddingBottom: MENU_CARD_VERTICAL_PADDING,
    gap: Spacing.md,
  },
  groupCard: {
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: MENU_CARD_VERTICAL_PADDING,
    paddingHorizontal: Spacing.md,
    paddingBottom: MENU_CARD_VERTICAL_PADDING,
    gap: Spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  groupTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  groupMeta: {
    fontSize: FontSize.xs,
  },
  groupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  allBtn: {
    minWidth: MIN_TOUCH_TARGET_ANDROID,
    minHeight: MIN_TOUCH_TARGET_ANDROID,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.md,
  },
  quickItem: {
    width: '25%',
    minHeight: QUICK_ITEM_MIN_HEIGHT,
    paddingHorizontal: 2,
    position: 'relative',
  },
  quickTapArea: {
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: QUICK_ITEM_MIN_HEIGHT,
  },
  quickItemRow: {
    width: '100%',
    minHeight: MIN_TOUCH_TARGET_ANDROID + Spacing.sm,
  },
  quickTapAreaRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    minHeight: MIN_TOUCH_TARGET_ANDROID + Spacing.sm,
    paddingHorizontal: Spacing.xs,
    gap: Spacing.md,
  },
  quickIconBox: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIconBoxRow: {
    width: MIN_TOUCH_TARGET_ANDROID,
    height: MIN_TOUCH_TARGET_ANDROID,
    borderRadius: Radius.md,
  },
  quickLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  quickLabelRow: {
    flex: 1,
    fontSize: FontSize.base,
    textAlign: 'left',
  },
  pinBtn: {
    position: 'absolute',
    top: -2,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  sheetToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sheetSearchWrap: {
    flex: 1,
  },
  editBtn: {
    minHeight: 34,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  sheetFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  editHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  sheetSection: {
    gap: Spacing.sm,
  },
  sheetSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  sheetSectionMeta: {
    fontSize: FontSize.xs,
  },
  sheetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.sm,
  },
  emptyWrap: {
    paddingVertical: Spacing.base,
  },
});
