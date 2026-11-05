import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { StockWarningQueryDto } from '../../../types/models/StockWarningQueryDto';
import type { StockWarningResponseDto } from '../../../types/models/StockWarningResponseDto';
import type { StockWarningSummaryDto } from '../../../types/models/StockWarningSummaryDto';
import { reportService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { LoadingView } from '../../../../core/components/LoadingView.tsx';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import type { RootStackParamList } from '../../../host/navigation';
import { formatQtyWithUnit } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';
import type { ReportFilterState } from './ReportContextBar.tsx';
import { ReportMetricCard } from './ReportMetricCard.tsx';
import { ReportPolicyDisclosure } from './ReportPolicyDisclosure.tsx';
import { StockWarehouseWarningsChart } from './StockWarehouseWarningsChart.tsx';

interface StockTabProps {
  filters: ReportFilterState;
}

function buildQuery(filters: ReportFilterState): StockWarningQueryDto {
  return {
    materialId: filters.materialId,
    warehouseId: filters.warehouseId,
    ownerType: filters.ownerType,
  };
}

export function StockTab({ filters }: StockTabProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [data, setData] = useState<StockWarningResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const query = useMemo(() => buildQuery(filters), [filters]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setData(await reportService.getStockWarning(query));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '加载库存报表失败');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleExportMaterials = async () => {
    setExporting(true);
    try {
      const csv = await reportService.exportMaterialsCSV();
      if (typeof csv !== 'string') throw new Error('导出结果格式异常');
      const path = `${FileSystem.cacheDirectory}materials.csv`;
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: '导出物料清单' });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '导出物料清单失败');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingView />;
  if (!data) {
    return (
      <EmptyState
        compact
        icon="alert-circle-outline"
        title="库存报表加载失败"
        action={{ label: '重试', onPress: () => void loadData() }}
      />
    );
  }

  const lowStockSummaries = data.lowStockSummaries;
  const warningMaterialCount = new Set(lowStockSummaries.map((summary) => summary.materialId)).size;
  const companyWarningCount = lowStockSummaries.filter((summary) => summary.companyLowStock).length;
  const customerWarningOwnerCount = lowStockSummaries.reduce(
    (total, summary) => total + summary.customerLowStockCount,
    0,
  );
  const openLowStockLedger = () =>
    navigation.navigate('Warehouse', {
      screen: 'WarehousesList',
      params: { lowStock: true },
    });

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.headingRow}>
        <View style={styles.headingText}>
          <Text style={[styles.title, { color: colors.text }]}>库存预警</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            点击指标或预警行进入库存台账
          </Text>
        </View>
        <ReportPolicyDisclosure items={['库存预警为实时库存快照，不支持按周期筛选。']} />
      </View>

      <View style={styles.metricsGrid}>
        <ReportMetricCard
          label="预警物料"
          value={warningMaterialCount}
          tone="error"
          icon="cube-outline"
          onPress={openLowStockLedger}
        />
        <ReportMetricCard
          label="公司库存预警"
          value={companyWarningCount}
          tone="warning"
          icon="business-outline"
          onPress={openLowStockLedger}
        />
        <ReportMetricCard
          label="客户货主预警"
          value={customerWarningOwnerCount}
          tone="primary"
          icon="people-outline"
          onPress={openLowStockLedger}
        />
      </View>

      <StockWarehouseWarningsChart
        summaries={lowStockSummaries}
        onOpenWarehouse={(warehouseId, warehouseName) =>
          navigation.navigate('Warehouse', {
            screen: 'WarehousesList',
            params: { lowStock: true, warehouseId, warehouseName },
          })
        }
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          低库存预警 ({lowStockSummaries.length})
        </Text>
        <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>按缺口优先</Text>
      </View>
      {!lowStockSummaries.length ? (
        <EmptyState compact icon="alert-circle-outline" title="暂无低库存预警" />
      ) : (
        lowStockSummaries.map((summary: StockWarningSummaryDto) => {
          const warningParts = [
            summary.companyLowStock
              ? `公司 ${formatQtyWithUnit(summary.companyAvailableQty, summary.material?.unit, unitLabelMap)} / ${formatQtyWithUnit(summary.companyAlertThreshold, summary.material?.unit, unitLabelMap)}`
              : null,
            summary.customerLowStockCount > 0
              ? `客户 ${summary.customerLowStockCount} 个货主预警`
              : null,
          ].filter((item): item is string => item !== null);

          return (
            <ListCard
              key={summary.id}
              style={[styles.stockCard, { borderColor: colors.border }]}
              onPress={() =>
                navigation.navigate('Warehouse', {
                  screen: 'WarehousesList',
                  params: {
                    lowStock: true,
                    materialId: summary.materialId,
                    materialName: summary.material?.name ?? '-',
                    warehouseId: summary.warehouseId,
                    warehouseName: summary.warehouse?.name,
                  },
                })
              }
              accessibilityLabel={`${summary.material?.name ?? '物料'}，${summary.warehouse?.name ?? '未指定仓库'}，库存预警`}
              accessibilityHint="打开库存台账"
            >
              <View style={styles.stockCardHeader}>
                <Text style={[styles.stockMatName, { color: colors.text }]} numberOfLines={2}>
                  {summary.material?.name ?? '-'}
                </Text>
                <Text style={[styles.stockQty, { color: colors.error }]}>
                  {formatQtyWithUnit(
                    summary.totalAvailableQty,
                    summary.material?.unit,
                    unitLabelMap,
                  )}
                </Text>
              </View>
              <Text style={[styles.stockOwnerQty, { color: colors.textSecondary }]}>
                公司可用{' '}
                {formatQtyWithUnit(
                  summary.companyAvailableQty,
                  summary.material?.unit,
                  unitLabelMap,
                )}{' '}
                · 客户可用{' '}
                {formatQtyWithUnit(
                  summary.customerAvailableQty,
                  summary.material?.unit,
                  unitLabelMap,
                )}
              </Text>
              <Text style={[styles.stockWarning, { color: colors.warning }]}>
                {warningParts.join(' · ')}
              </Text>
              <View style={styles.stockCardFooter}>
                <Text
                  style={[styles.stockWarehouse, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {summary.warehouse?.name ?? '-'} · {summary.material?.code ?? '-'} · 总可用{' '}
                  {formatQtyWithUnit(
                    summary.totalAvailableQty,
                    summary.material?.unit,
                    unitLabelMap,
                  )}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
              </View>
            </ListCard>
          );
        })
      )}

      <Pressable
        style={({ pressed }) => [
          styles.exportBtn,
          { borderColor: colors.border, opacity: exporting ? 0.6 : 1 },
          pressed && styles.pressed,
        ]}
        onPress={handleExportMaterials}
        disabled={exporting}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel="导出物料清单 CSV"
        accessibilityState={{ disabled: exporting, busy: exporting }}
      >
        <Ionicons name="download-outline" size={16} color={colors.primary} />
        <Text style={[styles.exportBtnText, { color: colors.primary }]}>
          {exporting ? '导出中…' : '导出物料清单CSV'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabContent: { padding: Spacing.md, gap: Spacing.sm },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  headingText: { flex: 1, gap: Spacing.xs },
  title: { fontSize: FontSize.lg, fontWeight: '700' },
  subtitle: { fontSize: FontSize.xs },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  sectionHint: { fontSize: FontSize.xs },
  stockCard: { borderWidth: StyleSheet.hairlineWidth },
  stockCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockMatName: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  stockQty: { fontSize: FontSize.base, fontWeight: '700' },
  stockOwnerQty: { fontSize: FontSize.xs },
  stockWarning: { fontSize: FontSize.xs, fontWeight: '500' },
  stockCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockWarehouse: { fontSize: FontSize.xs, flex: 1 },
  exportBtn: {
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
  },
  exportBtnText: { fontSize: FontSize.sm, fontWeight: '500' },
  pressed: { opacity: 0.72 },
});
