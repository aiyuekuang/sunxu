import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { forecastService, type GenerateForecastResponseDto } from '../../../host/services';
import { type Material, materialService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { DEFAULT_FORECAST_MONTHS } from '../../../constants/enums';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * @enum 代码逻辑依赖，不可改为字典
 * 原因：后端 forecast.service.ts 中 if(method) 选择不同计算算法
 * 审计日期：2026-04-02
 */
const ALGORITHM_OPTIONS = [
  { label: '移动平均', value: 'moving_avg' },
  { label: '指数平滑', value: 'exponential' },
];

const METHOD_LABEL: Record<string, string> = {
  moving_average: '移动平均',
  moving_avg: '移动平均',
  exponential: '指数平滑',
  exponential_smoothing: '指数平滑',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function GenerateTab() {
  const { colors } = useTheme();
  const [material, setMaterial] = useState<Material | null>(null);
  const [months, setMonths] = useState('3');
  const [algorithm, setAlgorithm] = useState('moving_avg');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateForecastResponseDto | null>(null);

  const fetchMaterials = useCallback(
    async (params: { keyword?: string; page?: number; pageSize?: number; categoryId?: string }) => {
      const res = await materialService.list({
        keyword: params.keyword,
        page: params.page,
        pageSize: params.pageSize,
        categoryId: params.categoryId,
      });
      return { list: res.list, total: res.total };
    },
    [],
  );

  const handleGenerate = async () => {
    if (!material) {
      toast.info('请选择物料');
      return;
    }

    setLoading(true);
    try {
      const res = await forecastService.generate({
        materialId: material.id,
        months: Number(months) || DEFAULT_FORECAST_MONTHS,
        algorithm,
      });
      setResult(res);
      toast.success('预测生成成功');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '生成失败';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.flex}
      contentContainerStyle={styles.tabContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={20}
    >
      <MaterialPickerField<Material>
        label="物料"
        value={material}
        onChange={setMaterial}
        fetchFn={fetchMaterials}
        keyExtractor={(m) => m.id}
        labelExtractor={(m) => m.name}
        sublabelExtractor={(m) => m.code}
        placeholder="请选择物料"
        required
        clearable
      />

      <FormField
        label="预测月数"
        value={months}
        onChangeText={setMonths}
        placeholder="默认3个月"
        keyboardType="number-pad"
      />

      <PickerField
        label="预测算法"
        value={algorithm}
        options={ALGORITHM_OPTIONS}
        onChange={setAlgorithm}
        required
      />

      <TouchableOpacity
        style={[
          styles.actionBtn,
          { backgroundColor: colors.primary },
          loading && styles.btnDisabled,
        ]}
        onPress={handleGenerate}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <InlineLoading />
        ) : (
          <Text style={[styles.actionBtnText, { color: colors.textOnPrimary }]}>生成预测</Text>
        )}
      </TouchableOpacity>

      {result && <ResultSummaryCard result={result} materialName={material?.name} />}
    </KeyboardAwareScrollView>
  );
}

// ─── Result Summary Card ──────────────────────────────────────────────────────

interface ResultSummaryCardProps {
  result: GenerateForecastResponseDto;
  materialName?: string;
}

function ResultSummaryCard({ result, materialName }: ResultSummaryCardProps) {
  const { colors } = useTheme();
  const isSuccess = result.count > 0;

  return (
    <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
      {/* Icon + Title */}
      <View style={styles.resultHeader}>
        <View
          style={[styles.resultIconWrap, { backgroundColor: isSuccess ? '#E8FFF5' : '#FFF5E8' }]}
        >
          <Ionicons
            name={isSuccess ? 'checkmark-circle' : 'information-circle'}
            size={28}
            color={isSuccess ? '#00B578' : '#FF8F1F'}
          />
        </View>
        <View style={styles.resultHeaderText}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>
            {isSuccess ? '预测生成成功' : '暂无预测数据'}
          </Text>
          <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
            {isSuccess
              ? `已为${materialName ? ` ${materialName} ` : ''}生成 ${result.count} 条预测记录`
              : '当前物料暂无足够的历史数据生成预测'}
          </Text>
        </View>
      </View>

      {/* Detail Rows */}
      <View style={[styles.resultDetails, { borderTopColor: colors.border }]}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>预测记录</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{result.count} 条</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>预测周期</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{result.period}</Text>
        </View>
        <View style={[styles.detailRow, styles.detailRowLast]}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>预测算法</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {METHOD_LABEL[result.method] ?? result.method}
          </Text>
        </View>
      </View>

      {/* Hint */}
      {isSuccess && (
        <Text style={[styles.resultHint, { color: colors.textMuted }]}>
          切换到"预测结果"标签页查看详细预测数据
        </Text>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabContent: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing['3xl'] },
  actionBtn: {
    paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: { opacity: 0.6 },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: '600' },

  // Result Card
  resultCard: {
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginTop: Spacing.sm,
    ...Shadow.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  resultIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultHeaderText: {
    flex: 1,
    gap: Spacing.xs,
  },
  resultTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  resultSubtitle: {
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  resultDetails: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailLabel: {
    fontSize: FontSize.sm,
  },
  detailValue: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  resultHint: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
