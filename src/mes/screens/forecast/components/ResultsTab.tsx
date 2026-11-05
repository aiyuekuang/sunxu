import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { type ForecastResult, forecastService } from '../../../host/services';
import { type Material, materialService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { PAGE_SIZE } from '../../../constants/enums';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatDate } from '../../../../core/utils/date';
import { formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';

export function ResultsTab() {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [results, setResults] = useState<ForecastResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleScanMaterial = useCallback(async (barcode: string) => {
    try {
      const material = await materialService.findByBarcode(barcode);
      setSelectedMaterial(material);
      toast.success(`已识别：${material.name}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '物料识别失败');
    }
  }, []);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await forecastService.list({
        materialCode: selectedMaterial?.code ?? undefined,
        page: 1,
        pageSize: PAGE_SIZE.MEDIUM,
      });
      setResults(res.list);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '查询失败');
    } finally {
      setLoading(false);
    }
  }, [selectedMaterial]);

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <MaterialPickerField<Material>
          label="物料筛选"
          value={selectedMaterial}
          onChange={setSelectedMaterial}
          fetchFn={({ page, pageSize, keyword, categoryId }) =>
            materialService.list({ page, pageSize, keyword, categoryId, includeInactive: true })
          }
          keyExtractor={(m) => m.id}
          labelExtractor={(m) => m.name}
          sublabelExtractor={(m) => `${m.code}  ·  ${formatUnitLabel(m.unit, unitLabelMap)}`}
          placeholder="搜索或扫码选择物料"
          title="选择物料"
          clearable
          scannable
          onScanResult={handleScanMaterial}
        />
        <TouchableOpacity
          style={[styles.queryBtn, { backgroundColor: colors.primary }]}
          onPress={fetchResults}
        >
          <Text style={[styles.queryBtnText, { color: colors.textOnPrimary }]}>查询</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <InlineLoading />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="analytics-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>暂无预测结果</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardMaterial, { color: colors.text }]}>
                  {item.materialName}
                </Text>
                <Text style={[styles.cardAlgo, { color: colors.textMuted }]}>
                  {item.method === 'moving_average' ? '移动平均' : '指数平滑'}
                </Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardMonth, { color: colors.textSecondary }]}>
                  {item.period}
                </Text>
                <Text style={[styles.cardQty, { color: colors.primary }]}>
                  预测: {item.forecastQty}
                </Text>
              </View>
              {item.confidence != null && (
                <Text style={[styles.cardConfidence, { color: colors.textMuted }]}>
                  置信度: {item.confidence.toFixed(0)}%
                </Text>
              )}
              <Text style={[styles.cardDate, { color: colors.textMuted }]}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingCenter: { marginTop: Spacing['3xl'], alignItems: 'center' },
  listContent: { padding: Spacing.md, gap: Spacing.sm },
  filterBar: { padding: Spacing.md, gap: Spacing.sm },
  queryBtn: {
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  queryBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyText: { fontSize: FontSize.base },
  card: { borderRadius: Radius.lg, padding: Spacing.base, gap: Spacing.xs, ...Shadow.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMaterial: { fontSize: FontSize.base, fontWeight: '600', flex: 1 },
  cardAlgo: { fontSize: FontSize.xs },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMonth: { fontSize: FontSize.sm },
  cardQty: { fontSize: FontSize.sm, fontWeight: '600' },
  cardConfidence: { fontSize: FontSize.xs },
  cardDate: { fontSize: FontSize.xs },
});
