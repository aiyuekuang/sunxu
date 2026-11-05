import { ScrollView, StyleSheet, View } from 'react-native';
import type { ControlChartData } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ControlChartProps {
  data: ControlChartData;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ControlChart({ data }: ControlChartProps) {
  const { colors } = useTheme();
  const points = data.points ?? [];
  if (points.length === 0) return null;

  const allXBar = points.map((p) => p.xBar);
  const minVal = Math.min(...allXBar, data.xBarLcl);
  const maxVal = Math.max(...allXBar, data.xBarUcl);
  const range = maxVal - minVal || 1;

  const chartWidth = Math.max(points.length * 40, 300);
  const chartHeight = 160;
  const valueLabel = data.chartType === 'i_mr' ? 'I' : 'X&#x0304;';
  const rangeLabel = data.chartType === 'i_mr' ? 'MR' : 'R';

  const toY = (v: number) => ((maxVal - v) / range) * chartHeight;

  return (
    <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.chartTitle, { color: colors.text }]}>{valueLabel} 控制图</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: chartWidth, height: chartHeight + 30 }}>
          {/* Control lines */}
          <View style={[styles.controlLine, { top: toY(data.xBarUcl), borderColor: colors.error }]}>
            <Text style={[styles.controlLineLabel, { color: colors.error }]}>
              UCL {data.xBarUcl.toFixed(3)}
            </Text>
          </View>
          <View
            style={[
              styles.controlLine,
              { top: toY(data.xBarCl), borderColor: colors.success, borderStyle: 'dashed' },
            ]}
          >
            <Text style={[styles.controlLineLabel, { color: colors.success }]}>
              CL {data.xBarCl.toFixed(3)}
            </Text>
          </View>
          <View style={[styles.controlLine, { top: toY(data.xBarLcl), borderColor: colors.error }]}>
            <Text style={[styles.controlLineLabel, { color: colors.error }]}>
              LCL {data.xBarLcl.toFixed(3)}
            </Text>
          </View>

          {/* Points */}
          <View
            style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: chartHeight }}
          >
            {points.map((pt, i) => {
              const x = i * 40 + 20;
              const y = toY(pt.xBar);
              const isOutOfControl = pt.xBar > data.xBarUcl || pt.xBar < data.xBarLcl;
              return (
                <View
                  key={pt.group}
                  style={[
                    styles.dataPoint,
                    {
                      left: x - 4,
                      top: y - 4,
                      backgroundColor: isOutOfControl ? colors.error : colors.primary,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.chartStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>UCL</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>{data.xBarUcl.toFixed(4)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>中心线</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {data.xBarCl.toFixed(4)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>LCL</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>{data.xBarLcl.toFixed(4)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>样本数</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{points.length}</Text>
        </View>
      </View>

      {/* R chart stats */}
      <Text style={[styles.chartTitle, { color: colors.text, marginTop: Spacing.sm }]}>
        {rangeLabel} 控制图
      </Text>
      <View style={styles.chartStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{rangeLabel}-UCL</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>{data.rUcl.toFixed(4)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{rangeLabel}-CL</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>{data.rCl.toFixed(4)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{rangeLabel}-LCL</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>{data.rLcl.toFixed(4)}</Text>
        </View>
      </View>

      {/* Data table */}
      <Text style={[styles.chartTitle, { color: colors.text, marginTop: Spacing.sm }]}>
        数据明细
      </Text>
      <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.textSecondary }]}>
          组号
        </Text>
        <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.textSecondary }]}>
          {valueLabel}
        </Text>
        <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.textSecondary }]}>
          {rangeLabel}
        </Text>
      </View>
      {points.map((pt) => {
        const isOutOfControl = pt.xBar > data.xBarUcl || pt.xBar < data.xBarLcl;
        return (
          <View
            key={`table-${pt.group}`}
            style={[styles.tableRow, { borderBottomColor: colors.border }]}
          >
            <Text style={[styles.tableCell, { color: colors.text }]}>{pt.group}</Text>
            <Text
              style={[
                styles.tableCell,
                {
                  color: isOutOfControl ? colors.error : colors.text,
                  fontWeight: isOutOfControl ? '700' : '400',
                },
              ]}
            >
              {pt.xBar.toFixed(4)}
            </Text>
            <Text style={[styles.tableCell, { color: colors.text }]}>{pt.range.toFixed(4)}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chartContainer: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  chartTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  controlLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1 },
  controlLineLabel: { position: 'absolute', right: 4, top: -14, fontSize: FontSize.xs },
  dataPoint: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  chartStats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  statItem: { alignItems: 'center', minWidth: 60 },
  statLabel: { fontSize: FontSize.xs },
  statValue: { fontSize: FontSize.sm, fontWeight: '600' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: Spacing.xs },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.xs,
  },
  tableCell: { flex: 1, fontSize: FontSize.xs, textAlign: 'center' },
  tableCellHeader: { fontWeight: '600', fontSize: FontSize.xs },
});
