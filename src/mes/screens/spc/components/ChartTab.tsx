import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { type ControlChartData, spcService } from '../../../host/services';
import { type Material, materialService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';
import { ControlChart } from './ControlChart.tsx';
import { SpcCharacteristicPicker } from './SpcCharacteristicPicker.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChartTabProps {
  insets: EdgeInsets;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChartTab({ insets }: ChartTabProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [characteristic, setCharacteristic] = useState('');
  const [chartData, setChartData] = useState<ControlChartData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!selectedMaterial) {
      toast.info('请选择要分析的物料');
      return;
    }
    if (!characteristic.trim()) {
      toast.info('请输入特征名称');
      return;
    }
    setLoading(true);
    try {
      const chart = await spcService.controlChart({
        materialId: selectedMaterial.id,
        characteristicName: characteristic.trim(),
      });
      setChartData(chart);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? '查询失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <View style={[styles.queryCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>控制图查询</Text>

        <MaterialPickerField<Material>
          label="物料"
          required
          value={selectedMaterial}
          onChange={(m) => {
            setSelectedMaterial(m);
            setChartData(null);
          }}
          fetchFn={(p) => materialService.list({ ...p, includeInactive: true })}
          keyExtractor={(m) => m.id}
          labelExtractor={(m) => m.name}
          sublabelExtractor={(m) => {
            const unitLabel = formatUnitLabel(m.unit, unitLabelMap);
            return `${m.code}${unitLabel ? ` · ${unitLabel}` : ''}`;
          }}
          placeholder="点击选择物料"
        />

        <SpcCharacteristicPicker
          materialId={selectedMaterial?.id}
          value={characteristic}
          onChangeText={(value) => {
            setCharacteristic(value);
            setChartData(null);
          }}
          required
        />

        <TouchableOpacity
          style={[styles.analyzeBtn, { backgroundColor: colors.primary }]}
          onPress={handleQuery}
          disabled={loading}
        >
          {loading ? (
            <InlineLoading />
          ) : (
            <Text style={[styles.analyzeBtnText, { color: colors.textOnPrimary }]}>查询控制图</Text>
          )}
        </TouchableOpacity>
      </View>

      {chartData && <ControlChart data={chartData} />}

      {!chartData && !loading && (
        <View style={styles.emptyState}>
          <Ionicons name="stats-chart-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
            输入物料和特征后查询控制图
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
            支持 X&#x0304;-R 和 I-MR 控制图，显示数据点和控制线
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: { padding: Spacing.md, gap: Spacing.md },
  queryCard: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: 2 },
  analyzeBtn: {
    marginTop: Spacing.xs,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  analyzeBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: Spacing['3xl'], gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.sm, fontWeight: '500' },
  emptyDesc: { fontSize: FontSize.sm, textAlign: 'center' },
});
