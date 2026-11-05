import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  type BatchProductSerialListItem,
  productSerialService,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { SERIAL_STATUS_LABELS } from '../../../constants/status-configs';
import { Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime } from '../../../../core/utils/date';

interface BatchSerialSectionProps {
  batchId: string;
  enabled: boolean;
}

export function BatchSerialSection({ batchId, enabled }: BatchSerialSectionProps) {
  const { colors } = useTheme();
  const [serials, setSerials] = useState<BatchProductSerialListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loadingRef = useRef(false);

  const loadPage = useCallback(
    async (nextPage: number, append = false) => {
      if (!enabled || loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError('');
      try {
        const result = await productSerialService.listForBatch(batchId, nextPage);
        setSerials((current) => (append ? [...current, ...result.list] : result.list));
        setTotal(result.total);
        setPage(result.page);
      } catch {
        setError('成品序列号读取失败，请重试');
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [batchId, enabled],
  );

  useEffect(() => {
    setSerials([]);
    setTotal(0);
    setPage(1);
    if (enabled) void loadPage(1);
  }, [enabled, loadPage]);

  if (!enabled) return null;

  return (
    <DetailCard title={`成品序列号（${total}）`}>
      {error ? (
        <Pressable onPress={() => void loadPage(page)}>
          <Text style={{ color: colors.error }}>{error} · 点击重试</Text>
        </Pressable>
      ) : null}
      {!error && !serials.length && !loading ? (
        <Text style={{ color: colors.textSecondary }}>该批号暂无关联序列号</Text>
      ) : null}
      {serials.map((serial) => (
        <View key={serial.id} style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.serialInfo}>
            <Text style={[styles.serialNo, { color: colors.text }]}>{serial.serialNo}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {SERIAL_STATUS_LABELS[serial.status] ?? '未知状态'}
            </Text>
          </View>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {serial.receivedAt
              ? `入库 ${formatDateTime(serial.receivedAt)}`
              : serial.producedAt
                ? `报工 ${formatDateTime(serial.producedAt)}`
                : ''}
          </Text>
        </View>
      ))}
      {loading ? (
        <Text style={[styles.action, { color: colors.textSecondary }]}>正在读取…</Text>
      ) : null}
      {!loading && serials.length < total ? (
        <Pressable style={styles.actionButton} onPress={() => void loadPage(page + 1, true)}>
          <Text style={[styles.action, { color: colors.primary }]}>继续查看</Text>
        </Pressable>
      ) : null}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  serialInfo: { flex: 1, gap: 2 },
  serialNo: { fontWeight: '600' },
  meta: { fontSize: 12 },
  actionButton: { alignSelf: 'center', padding: Spacing.sm },
  action: { textAlign: 'center' },
});
