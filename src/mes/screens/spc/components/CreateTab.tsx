import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { spcService } from '../../../host/services';
import { type Material, materialService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ContextualHelpButton } from '../../../../core/components/FormLabel.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';
import { SpcCharacteristicPicker } from './SpcCharacteristicPicker.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateTabProps {
  insets: EdgeInsets;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateTab({ insets }: CreateTabProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [characteristic, setCharacteristic] = useState('');
  const [measuredValue, setMeasuredValue] = useState('');
  const [sampleGroup, setSampleGroup] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!selectedMaterial) {
      toast.info('请选择物料');
      return;
    }
    if (!characteristic.trim()) {
      toast.info('请输入特征名称');
      return;
    }
    if (!measuredValue || Number.isNaN(Number(measuredValue))) {
      toast.info('请输入有效的测量值');
      return;
    }
    if (!sampleGroup || Number.isNaN(Number(sampleGroup)) || Number(sampleGroup) <= 0) {
      toast.info('请输入有效的样本组号');
      return;
    }
    setSaving(true);
    try {
      await spcService.create({
        materialId: selectedMaterial.id,
        characteristicName: characteristic.trim(),
        measuredValue: parseFloat(measuredValue),
        sampleGroup: parseInt(sampleGroup, 10),
      });
      toast.success('SPC 记录创建成功');
      setMeasuredValue('');
      // Keep material, characteristic, sampleGroup for batch entry
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? '创建失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
      <View style={[styles.queryCard, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>新增</Text>
          <ContextualHelpButton
            help={{
              title: '连续录入',
              purpose: '提交后测量值会清空，物料和特征名称会保留，便于连续录入同一组数据。',
            }}
          />
        </View>

        <MaterialPickerField<Material>
          label="物料"
          required
          value={selectedMaterial}
          onChange={setSelectedMaterial}
          fetchFn={(p) => materialService.list(p)}
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
          onChangeText={setCharacteristic}
          required
          allowManualFallback
        />

        <FormField
          label="测量值"
          required
          value={measuredValue}
          onChangeText={setMeasuredValue}
          placeholder="请输入测量值"
          keyboardType="numeric"
        />

        <FormField
          label="样本组号"
          required
          value={sampleGroup}
          onChangeText={setSampleGroup}
          placeholder="请输入样本组号（正整数）"
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={[styles.analyzeBtn, { backgroundColor: colors.success }]}
          onPress={handleCreate}
          disabled={saving}
        >
          {saving ? (
            <InlineLoading />
          ) : (
            <Text style={[styles.analyzeBtnText, { color: colors.textOnPrimary }]}>提交记录</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: { padding: Spacing.md, gap: Spacing.md },
  queryCard: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs, ...Shadow.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: 2 },
  analyzeBtn: {
    marginTop: Spacing.xs,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  analyzeBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
});
