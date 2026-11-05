import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  type StockBalancePreviewResponseDto,
  warehouseService,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

type MetricTone = 'default' | 'success' | 'warning' | 'error';

interface MetricItem {
  key: string;
  label: string;
  value: string;
  tone: MetricTone;
}

interface StockBalancePreviewProps {
  warehouseId?: string | null;
  materialId?: string | null;
  locationId?: string | null;
  storageLocation?: string | null;
  batchNo?: string | null;
  requiredQty?: number;
  adjustQty?: number;
}

function normalizeText(value?: string | null): string | undefined {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : undefined;
}

function formatQty(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) {
    return '-';
  }

  return Number(value.toFixed(4))
    .toFixed(4)
    .replace(/\.?0+$/, '');
}

function toOptionalFiniteNumber(value?: number): number | undefined {
  return value !== undefined && Number.isFinite(value) ? value : undefined;
}

export function StockBalancePreview({
  warehouseId,
  materialId,
  locationId,
  storageLocation,
  batchNo,
  requiredQty,
  adjustQty,
}: StockBalancePreviewProps) {
  const { colors } = useTheme();
  const [preview, setPreview] = useState<StockBalancePreviewResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!warehouseId || !materialId) {
      setPreview(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void warehouseService
      .balancePreview({
        warehouseId,
        materialId,
        locationId: normalizeText(locationId),
        storageLocation: normalizeText(storageLocation),
        batchNo: normalizeText(batchNo),
        requiredQty: toOptionalFiniteNumber(requiredQty),
        adjustQty: toOptionalFiniteNumber(adjustQty),
      })
      .then((result) => {
        if (cancelled) return;
        setPreview(result);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setPreview(null);
        setError(caught instanceof Error ? caught.message : '库存预览读取失败');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adjustQty, batchNo, locationId, materialId, requiredQty, storageLocation, warehouseId]);

  const metrics = useMemo<MetricItem[]>(() => {
    if (!preview) return [];
    const items: MetricItem[] = [
      {
        key: 'book',
        label: '账面',
        value: formatQty(preview.bookQty),
        tone: 'default',
      },
      {
        key: 'available',
        label: '可用',
        value: formatQty(preview.availableQty),
        tone: preview.sufficient === false ? 'error' : 'success',
      },
      {
        key: 'reserved',
        label: '占用',
        value: formatQty(preview.reservedQty),
        tone: preview.reservedQty > 0 ? 'warning' : 'default',
      },
      {
        key: 'frozen',
        label: '冻结',
        value: formatQty(preview.frozenQty),
        tone: preview.frozenQty > 0 ? 'warning' : 'default',
      },
    ];

    if (preview.batchNo && preview.batchAvailableQty !== null) {
      items.push({
        key: 'batch',
        label: '批号可用',
        value: formatQty(preview.batchAvailableQty),
        tone: preview.batchSufficient === false ? 'error' : 'success',
      });
    }

    if (preview.shortageQty != null && preview.shortageQty > 0) {
      items.push({
        key: 'shortage',
        label: '缺口',
        value: formatQty(preview.shortageQty),
        tone: 'error',
      });
    }

    if (preview.batchShortageQty != null && preview.batchShortageQty > 0) {
      items.push({
        key: 'batchShortage',
        label: '批号缺口',
        value: formatQty(preview.batchShortageQty),
        tone: 'error',
      });
    }

    if (preview.bookQtyAfterAdjust != null) {
      items.push({
        key: 'afterAdjust',
        label: '调整后账面',
        value: formatQty(preview.bookQtyAfterAdjust),
        tone: preview.bookQtyAfterAdjust < 0 ? 'error' : 'default',
      });
    }

    return items;
  }, [preview]);

  if (!warehouseId || !materialId) {
    return null;
  }

  const noticeItems = preview ? [...preview.blockers, ...preview.warnings] : [];

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>当前库存</Text>
        {loading ? <InlineLoading /> : null}
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : (
        <View style={styles.metricWrap}>
          {metrics.map((metric) => {
            const isSuccess = metric.tone === 'success';
            const isWarning = metric.tone === 'warning';
            const isError = metric.tone === 'error';
            const chipBackground = isError
              ? colors.errorSurface
              : isWarning
                ? colors.warningSurface
                : isSuccess
                  ? colors.successSurface
                  : colors.surfaceSecondary;
            const chipColor = isError
              ? colors.error
              : isWarning
                ? colors.warning
                : isSuccess
                  ? colors.success
                  : colors.textSecondary;
            return (
              <View
                key={metric.key}
                style={[styles.metricChip, { backgroundColor: chipBackground }]}
              >
                <Text style={[styles.metricLabel, { color: chipColor }]}>{metric.label}</Text>
                <Text style={[styles.metricValue, { color: chipColor }]}>{metric.value}</Text>
              </View>
            );
          })}
        </View>
      )}
      {noticeItems.length > 0 ? (
        <Text
          style={[
            styles.noticeText,
            { color: preview?.blockers.length ? colors.error : colors.warning },
          ]}
        >
          {noticeItems.join('；')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  metricWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  metricChip: {
    minWidth: 74,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 2,
  },
  metricLabel: {
    fontSize: FontSize.xs,
  },
  metricValue: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  errorText: {
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  noticeText: {
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
});
