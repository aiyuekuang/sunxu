import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { type CpkResult, type SpcCharacteristicOption, spcService } from '../../../host/services';
import { type Material, materialService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';
import { CpkCard } from './CpkCard.tsx';
import { SpcCharacteristicPicker } from './SpcCharacteristicPicker.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CpkTabProps {
  insets: EdgeInsets;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CpkTab({ insets }: CpkTabProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [characteristic, setCharacteristic] = useState('');
  const [upperSpec, setUpperSpec] = useState('');
  const [lowerSpec, setLowerSpec] = useState('');
  const [selectedCharacteristic, setSelectedCharacteristic] =
    useState<SpcCharacteristicOption | null>(null);
  const [cpkData, setCpkData] = useState<CpkResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCharacteristic?.hasSpecification) {
      setUpperSpec(String(selectedCharacteristic.upperLimit ?? ''));
      setLowerSpec(String(selectedCharacteristic.lowerLimit ?? ''));
      return;
    }
    setUpperSpec('');
    setLowerSpec('');
  }, [selectedCharacteristic]);

  const handleQuery = async () => {
    if (!selectedMaterial) {
      toast.info('请选择要分析的物料');
      return;
    }
    if (!characteristic.trim()) {
      toast.info('请输入特征名称');
      return;
    }
    if (!upperSpec || Number.isNaN(Number(upperSpec))) {
      toast.info('请输入有效的规格上限');
      return;
    }
    if (!lowerSpec || Number.isNaN(Number(lowerSpec))) {
      toast.info('请输入有效的规格下限');
      return;
    }
    const upperSpecValue = parseFloat(upperSpec);
    const lowerSpecValue = parseFloat(lowerSpec);
    if (upperSpecValue <= lowerSpecValue) {
      toast.info('规格上限必须大于规格下限');
      return;
    }
    if (selectedCharacteristic && selectedCharacteristic.recordCount < 2) {
      toast.info(
        `当前特征仅有 ${selectedCharacteristic.recordCount} 条采样记录，至少需要 2 条才能计算 Cpk`,
      );
      return;
    }
    setLoading(true);
    try {
      const cpk = await spcService.cpk({
        materialId: selectedMaterial.id,
        characteristicName: characteristic.trim(),
        upperSpec: upperSpecValue,
        lowerSpec: lowerSpecValue,
      });
      setCpkData(cpk);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? '分析失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <View style={[styles.queryCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Cpk 分析</Text>

        <MaterialPickerField<Material>
          label="物料"
          required
          value={selectedMaterial}
          onChange={(m) => {
            setSelectedMaterial(m);
            setCpkData(null);
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
            setCpkData(null);
          }}
          onMetaChange={setSelectedCharacteristic}
          required
        />

        <View style={styles.specRow}>
          <FormField
            label="规格上限 (USL)"
            required
            containerStyle={styles.specField}
            value={upperSpec}
            onChangeText={(value) => {
              setUpperSpec(value);
              setCpkData(null);
            }}
            placeholder="上限"
            keyboardType="numeric"
          />
          <View style={styles.specSpacer} />
          <FormField
            label="规格下限 (LSL)"
            required
            containerStyle={styles.specField}
            value={lowerSpec}
            onChangeText={(value) => {
              setLowerSpec(value);
              setCpkData(null);
            }}
            placeholder="下限"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[styles.analyzeBtn, { backgroundColor: colors.primary }]}
          onPress={handleQuery}
          disabled={loading}
        >
          {loading ? (
            <InlineLoading />
          ) : (
            <Text style={[styles.analyzeBtnText, { color: colors.textOnPrimary }]}>
              开始 Cpk 分析
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {cpkData && <CpkCard data={cpkData} />}

      {!cpkData && !loading && (
        <View style={styles.emptyState}>
          <Ionicons name="analytics-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
            输入参数后开始 Cpk 分析
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
            需要提供规格上下限来计算过程能力指数
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
  specRow: { flexDirection: 'row' },
  specField: { flex: 1 },
  specSpacer: { width: Spacing.sm },
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
