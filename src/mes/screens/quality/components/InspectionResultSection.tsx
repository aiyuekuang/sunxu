import { StyleSheet, View } from 'react-native';
import type { QualityInspection } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import {
  getInspectionConclusionLabel,
  INSPECTION_CONCLUSION_CONFIG,
  INSPECTION_STATUS_CONFIG,
} from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber } from '../../../../core/utils/format';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InspectionResultSectionProps {
  inspection: QualityInspection;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InspectionResultSection({ inspection }: InspectionResultSectionProps) {
  const { colors } = useTheme();

  if (!inspection.sampleQty || inspection.sampleQty <= 0) return null;

  const sc = INSPECTION_STATUS_CONFIG[inspection.status] ?? {
    label: '未知状态',
    color: '#999999',
  };
  const conclusionConfig = inspection.conclusion
    ? (INSPECTION_CONCLUSION_CONFIG[inspection.conclusion] ?? sc)
    : sc;
  const passRate =
    inspection.sampleQty > 0 ? Math.round((inspection.passQty / inspection.sampleQty) * 100) : null;

  return (
    <DetailCard title="检验结果">
      <View style={styles.resultGrid}>
        <View style={[styles.resultItem, { backgroundColor: colors.background }]}>
          <Text style={[styles.resultNum, { color: colors.text }]}>
            {formatNumber(inspection.sampleQty)}
          </Text>
          <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>抽检数</Text>
        </View>
        <View style={[styles.resultItem, { backgroundColor: colors.successLight }]}>
          <Text style={[styles.resultNum, { color: colors.success }]}>
            {formatNumber(inspection.passQty)}
          </Text>
          <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>合格数</Text>
        </View>
        <View style={[styles.resultItem, { backgroundColor: colors.errorLight }]}>
          <Text style={[styles.resultNum, { color: colors.error }]}>
            {formatNumber(inspection.failQty)}
          </Text>
          <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>不合格数</Text>
        </View>
        <View
          style={[
            styles.resultItem,
            {
              backgroundColor:
                passRate !== null && passRate >= 95 ? colors.successLight : colors.warningLight,
            },
          ]}
        >
          <Text
            style={[
              styles.resultNum,
              {
                color: passRate !== null && passRate >= 95 ? colors.success : colors.warning,
              },
            ]}
          >
            {passRate !== null ? `${passRate}%` : '-'}
          </Text>
          <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>合格率</Text>
        </View>
      </View>
      {inspection.conclusion && (
        <View
          style={[
            styles.conclusionBadge,
            {
              backgroundColor: `${conclusionConfig.color}15`,
              borderColor: `${conclusionConfig.color}40`,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.conclusionText, { color: conclusionConfig.color }]}>
            结论：{getInspectionConclusionLabel(inspection.conclusion)}
          </Text>
        </View>
      )}
      {inspection.disposalNote && (
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          处置意见：{inspection.disposalNote}
        </Text>
      )}
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  resultGrid: { flexDirection: 'row', gap: Spacing.sm },
  resultItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    gap: 2,
  },
  resultNum: { fontSize: FontSize.base, fontWeight: '700' },
  resultLabel: { fontSize: FontSize.xs },
  conclusionBadge: {
    marginTop: Spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  conclusionText: { fontSize: FontSize.sm, fontWeight: '600' },
  note: { fontSize: FontSize.sm, lineHeight: 18 },
});
