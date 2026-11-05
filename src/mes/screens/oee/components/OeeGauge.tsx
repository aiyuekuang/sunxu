import { type DimensionValue, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OeeGaugeProps {
  value: number;
  label: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OeeGauge({ value, label }: OeeGaugeProps) {
  const { colors } = useTheme();
  const pct = Math.min(Math.max(value, 0), 100);
  const color = pct >= 85 ? colors.success : pct >= 70 ? colors.warning : colors.error;
  return (
    <View style={[styles.gaugeWrap, { backgroundColor: colors.surface }]}>
      <View style={[styles.gaugeTrack, { backgroundColor: colors.border }]}>
        <View
          style={[styles.gaugeFill, { width: `${pct}%` as DimensionValue, backgroundColor: color }]}
        />
      </View>
      <View style={styles.gaugeInfo}>
        <Text style={[styles.gaugeValue, { color }]}>{pct.toFixed(1)}%</Text>
        <Text style={[styles.gaugeLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  gaugeWrap: { borderRadius: Radius.md, padding: Spacing.sm, gap: Spacing.sm },
  gaugeTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  gaugeFill: { height: 10, borderRadius: 5 },
  gaugeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  gaugeValue: { fontSize: FontSize.base, fontWeight: '700' },
  gaugeLabel: { flex: 1, fontSize: FontSize.sm, lineHeight: 18, textAlign: 'right' },
});
