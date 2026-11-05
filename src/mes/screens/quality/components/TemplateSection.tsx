import { StyleSheet, View } from 'react-native';
import type { InspectionType } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TemplateSectionProps {
  type: InspectionType;
  sampleQty: string;
  onSampleQtyChange: (v: string) => void;
}

const AUTOMATIC_TEMPLATE_MESSAGES: Record<InspectionType, string> = {
  iqc: 'IQC 自动创建必须命中有效模板；仅在允许轻量质检的策略下，手工新增才可不带模板。',
  oqc: 'OQC 自动创建必须命中有效模板；仅在允许轻量质检的策略下，手工新增才可不带模板。',
  ipqc: 'IPQC 模板由工艺路线工序自动带出；严格质量策略下未配置或未生成会阻断后续工序。',
  fqc: 'FQC 模板由检验批规则自动带出；严格质量策略下自动创建必须命中有效模板。',
};

export function TemplateSection({ type, sampleQty, onSampleQtyChange }: TemplateSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>检验模板</Text>

      <View style={[styles.autoResolveNotice, { borderColor: colors.border }]}>
        <Text style={[styles.noticeText, { color: colors.textMuted }]}>
          {AUTOMATIC_TEMPLATE_MESSAGES[type]}
        </Text>
      </View>

      <QuickNumInput
        label="抽检数量"
        value={sampleQty}
        onChangeText={onSampleQtyChange}
        placeholder="1"
        min={0.0001}
        precision={4}
        quickButtons={[
          { label: '+1', value: 1 },
          { label: '+5', value: 5 },
        ]}
        containerStyle={{
          paddingTop: 4,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '600' },
  autoResolveNotice: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  noticeText: { fontSize: FontSize.sm, lineHeight: FontSize.lg },
});
