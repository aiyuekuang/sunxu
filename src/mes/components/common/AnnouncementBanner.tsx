import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, type AppStateStatus, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
}

export interface AnnouncementBannerProps {
  loadAnnouncements: () => Promise<AnnouncementItem[]>;
  onPressAnnouncement: (item: AnnouncementItem) => void;
  subscribeToNewAnnouncements?: (listener: () => void) => () => void;
  isFocused?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 24;
const ROTATE_INTERVAL = 4000;

export function AnnouncementBanner({
  loadAnnouncements,
  onPressAnnouncement,
  subscribeToNewAnnouncements,
  isFocused = true,
}: AnnouncementBannerProps) {
  const { colors } = useTheme();
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const translateY = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const list = await loadAnnouncements();
      setItems(list ?? []);
      setCurrentIndex(0);
      setDismissed(false);
      translateY.setValue(0);
    } catch {
      // ignore
    }
  }, [loadAnnouncements, translateY]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setAppState(nextState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isFocused || appState !== 'active') {
      return;
    }

    void fetchAnnouncements();
    const poll = setInterval(() => {
      void fetchAnnouncements();
    }, 5 * 60_000);
    const realtimeUnsub = subscribeToNewAnnouncements?.(() => void fetchAnnouncements());

    return () => {
      clearInterval(poll);
      realtimeUnsub?.();
    };
  }, [appState, fetchAnnouncements, isFocused, subscribeToNewAnnouncements]);

  // 多条公告时轮播
  useEffect(() => {
    if (items.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % items.length;
        Animated.timing(translateY, {
          toValue: -next * ITEM_HEIGHT,
          duration: 400,
          useNativeDriver: true,
        }).start();
        return next;
      });
    }, ROTATE_INTERVAL);

    return () => clearInterval(timerRef.current);
  }, [items.length, translateY]);

  if (dismissed || items.length === 0) return null;

  const handlePress = () => {
    const item = items[currentIndex];
    if (item) {
      onPressAnnouncement(item);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, { backgroundColor: colors.warningSurface }]}
    >
      <Ionicons name="megaphone-outline" size={16} color={colors.warning} />
      <View style={styles.marqueeWrap}>
        <Animated.View style={[styles.marqueeTrack, { transform: [{ translateY }] }]}>
          {items.map((item) => (
            <View key={item.id} style={styles.marqueeItem}>
              <Text numberOfLines={1} style={[styles.marqueeText, { color: colors.text }]}>
                {item.title}：{item.content}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>
      {items.length > 1 && (
        <Text style={[styles.counter, { color: colors.textTertiary }]}>
          {currentIndex + 1}/{items.length}
        </Text>
      )}
      <Pressable
        hitSlop={8}
        onPress={(e) => {
          e.stopPropagation();
          setDismissed(true);
        }}
      >
        <Ionicons name="close" size={14} color={colors.textTertiary} />
      </Pressable>
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: Radius.sm,
  },
  marqueeWrap: {
    flex: 1,
    height: ITEM_HEIGHT,
    overflow: 'hidden',
  },
  marqueeTrack: {
    // items stacked vertically
  },
  marqueeItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
  },
  marqueeText: {
    fontSize: FontSize.sm,
  },
  counter: {
    fontSize: FontSize.xs,
    flexShrink: 0,
  },
});
