import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { AppReleaseHistoryItem } from '../../mes/host/services';
import { appUpdateService } from '../../mes/host/services';
import { AppText as Text } from '../../core/components/AppText.tsx';
import { BottomSheet } from '../../core/components/BottomSheet.tsx';
import { EmptyState } from '../../core/components/EmptyState.tsx';
import { InlineLoading } from '../../core/components/LoadingView.tsx';
import { FontSize, FontWeight, Radius, Spacing } from '../../core/theme/tokens';
import { useTheme } from '../../core/theme/useTheme';
import { formatDateTime } from '../../core/utils/date';
import { formatAppVersion } from './appVersion';

interface AppReleaseHistorySheetProps {
  visible: boolean;
  onClose: () => void;
}

function formatVersion(item: AppReleaseHistoryItem): string {
  if (
    item.versionName &&
    item.versionCode !== null &&
    item.versionCode !== undefined
  ) {
    return `v${item.versionName} (${item.versionCode})`;
  }
  if (item.versionName) return `v${item.versionName}`;
  if (item.versionCode !== null && item.versionCode !== undefined) {
    return `版本号 ${item.versionCode}`;
  }
  return '未登记版本';
}

export function AppReleaseHistorySheet({
  visible,
  onClose,
}: AppReleaseHistorySheetProps) {
  const { colors } = useTheme();
  const [items, setItems] = useState<AppReleaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await appUpdateService.getHistory();
      setItems(result.items);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : '请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) void loadHistory();
  }, [loadHistory, visible]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="版本更新日志"
      subtitle={`当前版本 ${formatAppVersion()}`}
      maxHeightRatio={0.82}
    >
      {loading ? (
        <View style={styles.loadingState}>
          <InlineLoading size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>正在加载更新日志</Text>
        </View>
      ) : error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="更新日志加载失败"
          description={error}
          action={{ label: '重试', onPress: () => void loadHistory() }}
        />
      ) : items.length === 0 ? (
        <EmptyState compact icon="document-text-outline" title="暂无历史更新日志" />
      ) : (
        <View>
          {items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.releaseItem,
                index < items.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.releaseHeader}>
                <View style={styles.releaseTitleWrap}>
                  <Text style={[styles.version, { color: colors.text }]}>
                    {formatVersion(item)}
                  </Text>
                  {item.isCurrent ? (
                    <View style={[styles.currentBadge, { backgroundColor: colors.primarySurface }]}>
                      <Text style={[styles.currentBadgeText, { color: colors.primary }]}>当前版本</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {formatDateTime(item.publishedAt)}
                </Text>
              </View>
              <View style={styles.notesRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.textTertiary} />
                <Text style={[styles.notes, { color: colors.textSecondary }]}>
                  {item.releaseNotes || '暂无更新说明'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  loadingState: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing['2xl'],
  },
  loadingText: {
    fontSize: FontSize.sm,
  },
  releaseItem: {
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  releaseHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  releaseTitleWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  version: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  currentBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
  },
  currentBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  date: {
    flexShrink: 0,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs + Spacing.sm,
  },
  notesRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  notes: {
    flex: 1,
    fontSize: FontSize.base,
    lineHeight: FontSize.base + Spacing.sm,
  },
});
