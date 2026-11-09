import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  type LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { AppText } from './AppText';
import {
  FontSize,
  MIN_TOUCH_TARGET,
  MIN_TOUCH_TARGET_ANDROID,
  Radius,
  Spacing,
} from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface AudioPlayerProps {
  /** Visible and accessible name of the audio item. */
  title?: string;
  /** Idle status text. Defaults to "点击播放". */
  idleLabel?: string;
  durationSeconds?: number;
  currentTimeSeconds?: number;
  isPlaying: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  /** Stops a parent Pressable from also handling play/seek taps. */
  stopParentPressPropagation?: boolean;
  /** Playback implementation and errors remain owned by the host. */
  onToggle: () => void;
  /** Omit when seeking is not supported. */
  onSeek?: (seconds: number) => void;
}

function formatTime(value: number) {
  const seconds = Math.max(0, Math.floor(value || 0));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

/** Themed playback controls for caller-managed audio state and media sources. */
export function AudioPlayer({
  title = '音频',
  idleLabel = '点击播放',
  durationSeconds = 0,
  currentTimeSeconds = 0,
  isPlaying,
  isLoading = false,
  disabled = false,
  stopParentPressPropagation = false,
  onToggle,
  onSeek,
}: AudioPlayerProps) {
  const { colors } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);
  const duration = Math.max(0, durationSeconds);
  const currentTime = Math.min(Math.max(currentTimeSeconds, 0), duration || 0);
  const visibleTime = seekPreview ?? currentTime;
  const progress = duration > 0 ? Math.min(visibleTime / duration, 1) : 0;
  const canSeek = isPlaying && !isLoading && !disabled && Boolean(onSeek) && duration > 0;
  const seekTime = useCallback(
    (x: number) =>
      trackWidth && duration ? Math.min(Math.max(x / trackWidth, 0), 1) * duration : 0,
    [duration, trackWidth],
  );
  const onTrackLayout = (event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          canSeek && Math.abs(gesture.dx) > 4 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: (event) => setSeekPreview(seekTime(event.nativeEvent.locationX)),
        onPanResponderMove: (event) => setSeekPreview(seekTime(event.nativeEvent.locationX)),
        onPanResponderRelease: (event) => {
          const next = seekTime(event.nativeEvent.locationX);
          setSeekPreview(null);
          onSeek?.(next);
        },
        onPanResponderTerminate: () => setSeekPreview(null),
      }),
    [canSeek, onSeek, seekTime],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceSecondary }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? `暂停${title}` : `播放${title}`}
        accessibilityState={{ disabled: disabled || isLoading, busy: isLoading }}
        disabled={disabled || isLoading}
        onPress={(event) => {
          if (stopParentPressPropagation) event.stopPropagation();
          onToggle();
        }}
        hitSlop={4}
        style={({ pressed }) => [
          styles.playButton,
          {
            backgroundColor: colors.primarySurface,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={19}
            color={colors.primary}
            accessible={false}
          />
        )}
      </Pressable>
      <View style={styles.main}>
        <View style={styles.titleRow}>
          <AppText style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </AppText>
          <AppText style={[styles.state, { color: colors.textSecondary }]}>
            {isLoading ? '正在加载' : isPlaying ? '播放中' : idleLabel}
          </AppText>
        </View>
        <Pressable
          {...panResponder.panHandlers}
          accessibilityRole="adjustable"
          accessibilityLabel={`${title}播放进度`}
          accessibilityState={{ disabled: !canSeek }}
          accessibilityActions={[
            { name: 'decrement', label: '后退 5 秒' },
            { name: 'increment', label: '前进 5 秒' },
          ]}
          accessibilityValue={{
            min: 0,
            max: duration,
            now: visibleTime,
            text: `${formatTime(visibleTime)} / ${formatTime(duration)}`,
          }}
          onAccessibilityAction={(event) => {
            if (!canSeek) return;
            onSeek?.(
              Math.min(
                Math.max(currentTime + (event.nativeEvent.actionName === 'increment' ? 5 : -5), 0),
                duration,
              ),
            );
          }}
          onLayout={onTrackLayout}
          onPress={(event) => {
            if (stopParentPressPropagation) event.stopPropagation();
            if (canSeek) onSeek?.(seekTime(event.nativeEvent.locationX));
          }}
          style={styles.trackHitArea}
        >
          <View style={[styles.track, { backgroundColor: colors.border }]} pointerEvents="none">
            <View
              style={[
                styles.trackProgress,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </Pressable>
        <View style={styles.timeRow}>
          <AppText style={[styles.time, { color: colors.textSecondary }]}>
            {isPlaying ? formatTime(visibleTime) : '00:00'}
          </AppText>
          <AppText style={[styles.time, { color: colors.textSecondary }]}>{formatTime(duration)}</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    borderRadius: Radius.sm,
  },
  playButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  main: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: { fontSize: FontSize.xs, fontWeight: '600', flexShrink: 1 },
  state: { fontSize: FontSize.xs },
  trackHitArea: {
    minHeight: Math.max(MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID),
    justifyContent: 'center',
  },
  track: { height: 4, overflow: 'hidden', borderRadius: Radius.full },
  trackProgress: { height: '100%', borderRadius: Radius.full },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontSize: FontSize.xs, fontVariant: ['tabular-nums'] },
});
