import { StyleSheet, View } from 'react-native';
import type { WorkOrderDetail } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber } from '../../../../core/utils/format';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkOrderOutputReconciliationSectionProps {
  order: WorkOrderDetail;
  materialUnit: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * 完工入库对账：把「报工良品入库」与「让步接收转可用入库」在工单层对平。
 * 让步接收的不良品经质量处置已入可用成品库（来源处置单），单独注明，
 * 但不回写报工良品/不良口径（驱动良率/计件工资）。数据来自后端派生只读字段，
 * 仅在发生质量处置（让步/返工/净报废/待处置）时展示，避免对纯良品工单做冗余卡片。
 */
export function WorkOrderOutputReconciliationSection({
  order,
  materialUnit,
}: WorkOrderOutputReconciliationSectionProps) {
  const { colors } = useTheme();
  const recon = order.outputReconciliation;
  if (!recon) {
    return null;
  }

  const concession = Number(recon.concessionInboundQty ?? 0);
  const rework = Number(recon.reworkResolvedQty ?? 0);
  const netScrap = Number(recon.netScrapQty ?? 0);
  const pending = Number(recon.pendingDispositionQty ?? 0);
  const pendingInbound = Number(recon.pendingFinishedInboundQty ?? 0);
  const unproduced = Number(recon.unproducedQty ?? 0);
  // 有质量处置、或存在待入库/未产出差额时展示对账卡片；纯良品且已足额入库无需展示
  if (
    concession <= 0 &&
    rework <= 0 &&
    netScrap <= 0 &&
    pending <= 0 &&
    pendingInbound <= 0 &&
    unproduced <= 0
  ) {
    return null;
  }

  const rows: Array<{
    label: string;
    value: number;
    emphasize?: boolean;
    highlight?: boolean;
    danger?: boolean;
  }> = [
    { label: '良品完工入库', value: Number(recon.goodInboundQty ?? 0) },
    { label: '让步接收入库', value: concession, highlight: concession > 0 },
    {
      label: '实际入成品库合计',
      value: Number(recon.actualFinishedInboundQty ?? 0),
      emphasize: true,
    },
  ];
  if (pendingInbound > 0) {
    rows.push({
      label: '待入库（在制）',
      value: pendingInbound,
      highlight: true,
    });
  }
  rows.push({ label: '净报废', value: netScrap });
  if (rework > 0) {
    rows.push({ label: '返工转可用', value: rework });
  }
  if (pending > 0) {
    rows.push({ label: '待处置', value: pending });
  }
  if (unproduced > 0) {
    rows.push({ label: '未产出', value: unproduced, danger: true });
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, Shadow.sm]}>
      <Text style={[styles.title, { color: colors.text }]}>完工入库对账</Text>
      <View style={styles.rows}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{row.label}</Text>
            <Text
              style={[
                styles.value,
                {
                  color: row.danger
                    ? colors.error
                    : row.highlight
                      ? colors.warning
                      : row.emphasize
                        ? colors.primary
                        : colors.text,
                  fontWeight: row.emphasize ? '700' : '600',
                },
              ]}
            >
              {formatNumber(row.value, { maximumFractionDigits: 4 })} {materialUnit}
            </Text>
          </View>
        ))}
      </View>
      <Text style={[styles.note, { color: colors.textTertiary }]}>
        让步接收已入可用成品库（来源处置单），单独注明，不回写报工良品/不良口径。
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 8,
    marginHorizontal: Spacing.sm,
  },
  title: { fontSize: FontSize.md, fontWeight: '700' },
  rows: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: FontSize.sm },
  value: { fontSize: FontSize.sm },
  note: { fontSize: FontSize.xs, lineHeight: 16 },
});
