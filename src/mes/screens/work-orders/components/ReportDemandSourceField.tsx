import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { WorkOrderDemandAllocationTraceDto } from '../../../types/models/WorkOrderDemandAllocationTraceDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber } from '../../../../core/utils/format';
import { ceilTo } from '../../../utils/production-plan-quantity';

type DemandSource = WorkOrderDemandAllocationTraceDto;

function formatAllocatedPlannedQty(value: number): string {
  return formatNumber(ceilTo(value, 0), { fallback: '-', maximumFractionDigits: 0 });
}

interface ReportDemandSourceFieldProps {
  allocations?: DemandSource[] | null;
  value?: string | null;
  onChange: (demandLineId: string | null) => void;
}

function getSourceLabel(source: DemandSource): string {
  const orderNo = source.sourceOrderNo || '直接计划';
  const customer = source.customerName ? ` · ${source.customerName}` : '';
  return `${orderNo} · 需求行 ${source.demandLineNo}${customer}`;
}

function getSourceSublabel(source: DemandSource): string {
  const dueDate = source.dueDate ? `交期 ${source.dueDate}` : '';
  const qty = `工单投产分配 ${formatAllocatedPlannedQty(source.allocatedPlannedQty)}`;
  const remark = source.sourceRemarkSnapshot?.trim();
  return [dueDate, qty, remark ? `来源备注：${remark}` : ''].filter(Boolean).join(' · ');
}

export function ReportDemandSourceField({
  allocations = [],
  value,
  onChange,
}: ReportDemandSourceFieldProps) {
  const { colors } = useTheme();
  const sources = useMemo(() => {
    const byDemandLine = new Map<string, DemandSource>();
    for (const allocation of allocations ?? []) {
      if (allocation.demandStatus === 'cancelled' || allocation.demandStatus === 'closed') {
        continue;
      }
      const existing = byDemandLine.get(allocation.demandLineId);
      byDemandLine.set(
        allocation.demandLineId,
        existing
          ? {
              ...existing,
              allocatedPlannedQty:
                Number(existing.allocatedPlannedQty) + Number(allocation.allocatedPlannedQty),
            }
          : allocation,
      );
    }
    return [...byDemandLine.values()];
  }, [allocations]);
  const selected = sources.find((item) => item.demandLineId === value) ?? null;
  const fetchSources = useCallback(
    async ({ page, pageSize, keyword }: { page: number; pageSize: number; keyword?: string }) => {
      const normalizedKeyword = keyword?.trim().toLocaleLowerCase();
      const filtered = normalizedKeyword
        ? sources.filter((source) =>
            [getSourceLabel(source), getSourceSublabel(source)]
              .join(' ')
              .toLocaleLowerCase()
              .includes(normalizedKeyword),
          )
        : sources;
      const start = (page - 1) * pageSize;
      return { list: filtered.slice(start, start + pageSize), total: filtered.length };
    },
    [sources],
  );

  if (sources.length === 0) return null;

  if (sources.length === 1) {
    const source = sources[0];
    return (
      <View style={[styles.summary, { backgroundColor: colors.surfaceSecondary }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>本次报工来源</Text>
        <Text style={{ color: colors.text }}>{getSourceLabel(source)}</Text>
        <Text style={{ color: colors.textSecondary }}>
          工单投产分配：{formatAllocatedPlannedQty(source.allocatedPlannedQty)}
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          当前工序累计报工不得超过此数量；计划完成按该来源计算。
        </Text>
        {source.sourceRemarkSnapshot ? (
          <Text style={{ color: colors.textSecondary }}>
            来源备注：{source.sourceRemarkSnapshot}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EntityPickerField<DemandSource>
        label="本次报工来源"
        value={selected}
        onChange={(source) => onChange(source?.demandLineId ?? null)}
        fetchFn={fetchSources}
        keyExtractor={(source) => source.demandLineId}
        labelExtractor={getSourceLabel}
        sublabelExtractor={getSourceSublabel}
        title="选择本次报工来源"
        placeholder="请选择本次报工对应的来源订单"
        required
        clearable={false}
      />
      <Text style={[styles.note, { color: colors.textSecondary }]}>
        本次产出归属所选来源计划，当前工序报工量不得超过该计划在工单中的投产分配量；计划完成按该来源累计。
      </Text>
      {selected?.sourceRemarkSnapshot ? (
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          来源备注：{selected.sourceRemarkSnapshot}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  summary: { borderRadius: 10, padding: Spacing.md, gap: 4, marginBottom: Spacing.md },
  label: { fontSize: 12, marginBottom: 2 },
  note: { marginTop: -Spacing.xs, marginBottom: Spacing.md },
});
