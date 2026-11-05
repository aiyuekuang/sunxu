import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { AuditLogItemDto } from '../../../types/models/AuditLogItemDto';
import { scheduleService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard, InfoRow } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatShortDateTime } from '../../../../core/utils/date';
import { toast } from '../../../../core/toast';

export type CalendarHistoryTarget = {
  kind: 'shift' | 'exception';
  id: string;
  name: string;
};

interface CalendarChangeHistoryModalProps {
  target: CalendarHistoryTarget | null;
  onClose: () => void;
}

const PAGE_SIZE = 20;

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    create: '新增',
    update: '修改',
    delete: '删除',
  };
  return labels[action] ?? '变更';
}

export function CalendarChangeHistoryModal({ target, onClose }: CalendarChangeHistoryModalProps) {
  const { colors } = useTheme();
  const [items, setItems] = useState<AuditLogItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (requestedPage: number, replace: boolean) => {
      if (!target) return;
      setLoading(true);
      setLoadError(null);
      try {
        const response =
          target.kind === 'shift'
            ? await scheduleService.getShiftHistory({
                resourceId: target.id,
                page: requestedPage,
                pageSize: PAGE_SIZE,
              })
            : await scheduleService.getExceptionHistory({
                resourceId: target.id,
                page: requestedPage,
                pageSize: PAGE_SIZE,
              });
        setItems((current) => (replace ? response.list : [...current, ...response.list]));
        setTotal(response.total);
        setPage(response.page);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '加载变更记录失败';
        setLoadError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [target],
  );

  useEffect(() => {
    if (!target) return;
    setItems([]);
    setTotal(0);
    setPage(1);
    void loadPage(1, true);
  }, [loadPage, target]);

  return (
    <FullScreenModal
      visible={target !== null}
      onClose={onClose}
      title="变更记录"
      subtitle={target?.name}
    >
      {loading && items.length === 0 ? (
        <InlineLoading />
      ) : items.length === 0 && loadError ? (
        <EmptyState
          compact
          icon="alert-circle-outline"
          title="加载失败"
          description={loadError}
          action={{ label: '重试', onPress: () => void loadPage(1, true) }}
        />
      ) : items.length === 0 ? (
        <EmptyState compact icon="time-outline" title="暂无变更记录" />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <DetailCard
              key={item.id}
              title={getActionLabel(item.action)}
              right={
                <Text style={[styles.time, { color: colors.textTertiary }]}>
                  {formatShortDateTime(item.createdAt)}
                </Text>
              }
            >
              <InfoRow label="操作人" value={item.userName ?? '未知用户'} />
              <View style={styles.changeContent}>
                <Text style={[styles.changeLabel, { color: colors.textSecondary }]}>变更内容</Text>
                <Text style={[styles.changeDescription, { color: colors.text }]}>
                  {item.description ?? '—'}
                </Text>
              </View>
            </DetailCard>
          ))}
          {items.length < total && (
            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={() => void loadPage(page + 1, false)}
              style={styles.loadMore}
            >
              <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                {loading ? '加载中…' : '加载更多'}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.sm },
  time: { fontSize: FontSize.xs },
  changeContent: { gap: Spacing.xs, paddingTop: Spacing.xs },
  changeLabel: { fontSize: FontSize.xs },
  changeDescription: { fontSize: FontSize.sm, lineHeight: 20 },
  loadMore: { alignItems: 'center', paddingVertical: Spacing.md },
  loadMoreText: { fontSize: FontSize.sm, fontWeight: '600' },
});
