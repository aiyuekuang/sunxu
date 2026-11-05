import { type DimensionValue, StyleSheet, View } from 'react-native';
import type { Tooling } from '../../../host/services';
import { getToolingLifePercent } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard, InfoRow } from '../../../../core/components/DetailCard.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

function getLifeColor(
  pct: number,
  colors: { error: string; warning: string; success: string },
): string {
  if (pct >= 100) return colors.error;
  if (pct >= 80) return colors.warning;
  return colors.success;
}

export interface LifeSectionProps {
  tooling: Tooling;
}

export function LifeSection({ tooling }: LifeSectionProps) {
  const { colors } = useTheme();
  const lifeCountUnit = tooling.lifeCountUnit || '次';
  const hasCount = !!(tooling.maxUseCount && tooling.maxUseCount > 0);
  const hasHours = !!(tooling.maxUseHours && Number(tooling.maxUseHours) > 0);

  if (!hasCount && !hasHours) return null;

  const pct = getToolingLifePercent(tooling);
  const color = getLifeColor(pct, colors);

  return (
    <DetailCard title="寿命状态">
      <View style={styles.pctRow}>
        <Text style={[styles.pctLabel, { color: colors.textSecondary }]}>综合寿命使用率</Text>
        <Text style={[styles.pctValue, { color }]}>{pct}%</Text>
        {pct >= tooling.warningThreshold && (
          <View style={[styles.warnBadge, { backgroundColor: colors.warningLight }]}>
            <Text style={[styles.warnText, { color: colors.warning }]}>⚠ 接近寿命</Text>
          </View>
        )}
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(pct, 100)}%` as DimensionValue, backgroundColor: color },
          ]}
        />
      </View>
      {hasCount && (
        <InfoRow
          label="累计寿命"
          value={`${tooling.currentUseCount} / ${tooling.maxUseCount} ${lifeCountUnit}`}
        />
      )}
      {hasHours && (
        <InfoRow
          label="使用工时"
          value={`${Number(tooling.currentUseHours).toFixed(1)} / ${Number(tooling.maxUseHours).toFixed(1)} h`}
        />
      )}
      <InfoRow label="预警阈值" value={`${tooling.warningThreshold}%`} last />
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  pctRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, marginTop: 2 },
  pctLabel: { fontSize: FontSize.sm },
  pctValue: { fontSize: FontSize.md, fontWeight: '700' },
  warnBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  warnText: { fontSize: FontSize.xs, fontWeight: '600' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 3 },
  progressFill: { height: 6, borderRadius: 3 },
});
