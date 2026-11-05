import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { QualityDefect } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { QUALITY_DEFECT_SEVERITY_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';

interface QualityDefectListProps {
  defects: QualityDefect[];
  emptyTitle?: string;
  emptyDescription?: string;
  style?: ViewStyle;
}

export function QualityDefectList({
  defects,
  emptyTitle = '暂无缺陷记录',
  emptyDescription,
  style,
}: QualityDefectListProps) {
  const { colors } = useTheme();
  const { labelMap: defectCodeLabelMap } = useDict('defect_code');

  if (!defects || defects.length === 0) {
    return (
      <EmptyState
        compact
        icon="alert-circle-outline"
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <View style={style}>
      {defects.map((defect, idx) => (
        <View
          key={defect.id}
          style={[
            styles.defectRow,
            idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
          ]}
        >
          <View style={styles.defectMain}>
            {defect.defectCode ? (
              <Text style={[styles.defectCode, { color: colors.textSecondary }]}>
                {defectCodeLabelMap[defect.defectCode] ?? defect.defectCode}
              </Text>
            ) : null}
            <Text style={[styles.defectDesc, { color: colors.text }]}>{defect.description}</Text>
            <Text style={[styles.defectMeta, { color: colors.textSecondary }]}>
              数量：{defect.qty}
            </Text>
            {defect.remarks ? (
              <Text style={[styles.defectMeta, { color: colors.textSecondary }]} numberOfLines={2}>
                备注：{defect.remarks}
              </Text>
            ) : null}
          </View>
          <View
            style={[
              styles.severityBadge,
              {
                backgroundColor: `${QUALITY_DEFECT_SEVERITY_CONFIG[defect.severity ?? '']?.color ?? colors.textMuted}20`,
              },
            ]}
          >
            <Text
              style={[
                styles.severityText,
                {
                  color:
                    QUALITY_DEFECT_SEVERITY_CONFIG[defect.severity ?? '']?.color ??
                    colors.textMuted,
                },
              ]}
            >
              {QUALITY_DEFECT_SEVERITY_CONFIG[defect.severity ?? '']?.label ?? defect.severity}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  defectRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  defectMain: {
    flex: 1,
    gap: 2,
  },
  defectCode: {
    fontSize: FontSize.xs,
  },
  defectDesc: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  defectMeta: {
    fontSize: FontSize.xs,
  },
  severityBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  severityText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
