import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { CpkResult } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CpkCardProps {
  data: CpkResult;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CpkCard = React.memo(function CpkCard({ data }: CpkCardProps) {
  const { colors } = useTheme();

  const getCpkColor = (cpk: number) => {
    if (cpk >= 1.33) return colors.success;
    if (cpk >= 1.0) return colors.warning;
    return colors.error;
  };
  const getCpkLabel = (cpk: number) => {
    if (cpk >= 1.33) return '优秀';
    if (cpk >= 1.0) return '合格';
    return '不合格';
  };
  const cpkColor = getCpkColor(data.cpk);

  const rows = [
    { label: '均值 (Mean)', value: data.mean.toFixed(4), color: colors.text },
    { label: '标准差 (StdDev)', value: data.stdDev.toFixed(4), color: colors.text },
    { label: 'Cp', value: data.cp.toFixed(4), color: colors.text },
    { label: 'Cpk', value: data.cpk.toFixed(4), color: cpkColor, bold: true },
    { label: 'Cpu', value: data.cpu.toFixed(4), color: colors.text },
    { label: 'Cpl', value: data.cpl.toFixed(4), color: colors.text },
    { label: '样本数', value: String(data.sampleCount), color: colors.text },
  ];

  return (
    <View style={[styles.cpkCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.chartTitle, { color: colors.text }]}>过程能力指数 (Cpk)</Text>
      <View style={styles.cpkMain}>
        <Text style={[styles.cpkValue, { color: cpkColor }]}>{data.cpk.toFixed(4)}</Text>
        <View style={[styles.cpkBadge, { backgroundColor: `${cpkColor}20` }]}>
          <Text style={[styles.cpkBadgeText, { color: cpkColor }]}>{getCpkLabel(data.cpk)}</Text>
        </View>
      </View>

      {data.cpk < 1.33 && (
        <View style={[styles.warningBanner, { backgroundColor: colors.errorLight }]}>
          <Ionicons name="warning" size={14} color={colors.error} />
          <Text style={[styles.warningText, { color: colors.error }]}>
            Cpk &lt; 1.33，过程能力不足，请关注质量改进
          </Text>
        </View>
      )}

      {rows.map((row) => (
        <View key={row.label} style={[styles.cpkRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.cpkRowLabel, { color: colors.textSecondary }]}>{row.label}</Text>
          <Text
            style={[styles.cpkRowValue, { color: row.color, fontWeight: row.bold ? '700' : '600' }]}
          >
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chartTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  cpkCard: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  cpkMain: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  cpkValue: { fontSize: FontSize['4xl'], fontWeight: '700' },
  cpkBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  cpkBadgeText: { fontSize: FontSize.sm, fontWeight: '700' },
  cpkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cpkRowLabel: { fontSize: FontSize.sm },
  cpkRowValue: { fontSize: FontSize.sm, fontWeight: '600' },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  warningText: { fontSize: FontSize.xs, fontWeight: '500', flex: 1 },
});
