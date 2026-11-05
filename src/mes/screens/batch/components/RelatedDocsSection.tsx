import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { BatchRelatedDocs } from '../../../host/services';
import { batchService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import type { RootStackParamList } from '../../../host/navigation';
import { formatQtyWithUnit } from '../../../utils/qty-unit';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RelatedDocsSectionProps {
  batchId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RelatedDocsSection({ batchId }: RelatedDocsSectionProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [data, setData] = useState<BatchRelatedDocs | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await batchService.relatedDocs(batchId);
      setData(docs);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  if (loading) return <InlineLoading />;
  if (!data)
    return (
      <EmptyState
        compact
        icon="alert-circle-outline"
        title="加载失败"
        action={{ label: '重试', onPress: loadDocs }}
      />
    );

  const hasWorkOrders = data.workOrders.length > 0;
  const hasTransactions = data.stockTransactions.length > 0;
  const hasInspections = data.inspections.length > 0;
  const isEmpty = !hasWorkOrders && !hasTransactions && !hasInspections;

  if (isEmpty) return null;

  return (
    <>
      {hasWorkOrders && (
        <DetailCard title={`关联工单 (${data.workOrders.length})`}>
          {data.workOrders.map((wo, i) => (
            <Pressable
              key={wo.id}
              onPress={() =>
                navigation.navigate('WorkOrders', {
                  screen: 'WorkOrderDetail',
                  params: { id: wo.id },
                })
              }
              style={({ pressed }) => [
                styles.docRow,
                i < data.workOrders.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={[styles.docCode, { color: colors.primary }]}>{wo.orderNo}</Text>
              <Text style={[styles.docMeta, { color: colors.textSecondary }]}>
                {wo.materialName ?? ''}
              </Text>
            </Pressable>
          ))}
        </DetailCard>
      )}

      {hasTransactions && (
        <DetailCard title={`库存流水 (${data.stockTransactions.length})`}>
          {data.stockTransactions.slice(0, 5).map((tx, i) => (
            <View
              key={tx.id}
              style={[
                styles.docRow,
                i < Math.min(data.stockTransactions.length, 5) - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.docCode, { color: colors.text }]}>
                {tx.type === 'IN' ? '入库' : '出库'}{' '}
                {formatQtyWithUnit(tx.qty, tx.material?.unit, unitLabelMap)}
              </Text>
              <Text style={[styles.docMeta, { color: colors.textMuted }]}>{tx.createdAt}</Text>
            </View>
          ))}
          {data.stockTransactions.length > 5 && (
            <Text style={[styles.moreText, { color: colors.textMuted }]}>
              还有 {data.stockTransactions.length - 5} 条...
            </Text>
          )}
        </DetailCard>
      )}

      {hasInspections && (
        <DetailCard title={`质检记录 (${data.inspections.length})`}>
          {data.inspections.map((insp, i) => (
            <Pressable
              key={insp.id}
              onPress={() => navigation.navigate('QualityDetail', { id: insp.id })}
              style={({ pressed }) => [
                styles.docRow,
                i < data.inspections.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={[styles.docCode, { color: colors.primary }]}>{insp.inspectionNo}</Text>
              <Text style={[styles.docMeta, { color: colors.textSecondary }]}>
                {insp.result ?? ''} {insp.type ?? ''}
              </Text>
            </Pressable>
          ))}
        </DetailCard>
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  docCode: { fontSize: FontSize.sm, fontWeight: '500' },
  docMeta: { fontSize: FontSize.xs },
  moreText: { fontSize: FontSize.xs, textAlign: 'center', paddingVertical: Spacing.xs },
});
