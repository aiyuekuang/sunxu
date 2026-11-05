import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { type DimensionValue, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { MrpCalculationMode, MrpItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import {
  MRP_SUPPLY_ALLOCATION_STATUS_CONFIG,
  MRP_SUPPLY_SOURCE_CONFIG,
  MRP_SUGGESTION_CONFIG,
  UNKNOWN_STATUS_FALLBACK,
} from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatQtyWithUnit } from '../../../utils/qty-unit';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MrpItemCardProps {
  item: MrpItem;
  calculationMode: MrpCalculationMode;
}

const formatCalculationSnapshots = (snapshots?: Array<Record<string, unknown>>): string[] =>
  (snapshots ?? []).map((snapshot) => {
    const formulaCode = typeof snapshot.formulaCode === 'string' ? snapshot.formulaCode : null;
    const formula = typeof snapshot.formula === 'string' ? snapshot.formula : null;
    const result =
      snapshot.result && typeof snapshot.result === 'object'
        ? (snapshot.result as Record<string, unknown>)
        : null;
    const requiredQty =
      typeof result?.requiredQty === 'number' ? `结果 ${result.requiredQty}` : null;
    return [formulaCode, formula, requiredQty].filter(Boolean).join(' · ');
  });

const getSupplySourceLabel = (sourceType: string): string =>
  MRP_SUPPLY_SOURCE_CONFIG[sourceType] ?? sourceType;

const getSupplyAllocationStatusLabel = (status?: string | null): string =>
  status ? (MRP_SUPPLY_ALLOCATION_STATUS_CONFIG[status] ?? status) : '-';

// ─── Component ────────────────────────────────────────────────────────────────

export const MrpItemCard = React.memo(function MrpItemCard({
  item,
  calculationMode,
}: MrpItemCardProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [expanded, setExpanded] = useState(false);

  const cfg = MRP_SUGGESTION_CONFIG[item.suggestion] ?? {
    ...UNKNOWN_STATUS_FALLBACK,
    label: item.suggestion,
    icon: 'help-outline' as const,
  };

  const coverageRate = useMemo(
    () => (item.grossRequirement > 0 ? (item.currentStock / item.grossRequirement) * 100 : 100),
    [item.grossRequirement, item.currentStock],
  );

  const barColor =
    coverageRate >= 100 ? colors.success : coverageRate >= 50 ? colors.warning : colors.error;

  const supplyAllocations = item.supplyAllocations ?? [];
  const canExpand = item.sources.length > 0 || supplyAllocations.length > 0;

  return (
    <ListCard>
      <View style={styles.cardHeader}>
        <View style={styles.materialInfo}>
          <Text style={[styles.materialName, { color: colors.text }]} numberOfLines={1}>
            {item.materialName}
          </Text>
          <Text style={[styles.materialNo, { color: colors.textSecondary }]}>
            {item.materialCode}
          </Text>
        </View>
        <View style={[styles.suggestionBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={12} color={cfg.color} />
          <Text style={[styles.suggestionText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {calculationMode === 'net' && (
        <View style={styles.stockRow}>
          <View style={[styles.stockTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.stockFill,
                {
                  width: `${Math.min(coverageRate, 100)}%` as DimensionValue,
                  backgroundColor: barColor,
                },
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.qtyGrid}>
        <View style={styles.qtyItem}>
          <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>毛需求</Text>
          <Text style={[styles.qtyValue, { color: colors.text }]}>
            {formatQtyWithUnit(item.grossRequirement, item.unit, unitLabelMap)}
          </Text>
        </View>
        {calculationMode === 'net' && (
          <>
            <View style={styles.qtyItem}>
              <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>已领料</Text>
              <Text
                style={[
                  styles.qtyValue,
                  { color: item.issuedQty > 0 ? colors.success : colors.textMuted },
                ]}
              >
                {formatQtyWithUnit(item.issuedQty, item.unit, unitLabelMap)}
              </Text>
            </View>
            <View style={styles.qtyItem}>
              <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>可用库存</Text>
              <Text style={[styles.qtyValue, { color: colors.text }]}>
                {formatQtyWithUnit(item.currentStock, item.unit, unitLabelMap)}
              </Text>
            </View>
            <View style={styles.qtyItem}>
              <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>采购供给</Text>
              <Text
                style={[
                  styles.qtyValue,
                  { color: item.onOrderQty > 0 ? colors.success : colors.textMuted },
                ]}
              >
                {formatQtyWithUnit(item.onOrderQty, item.unit, unitLabelMap)}
              </Text>
            </View>
            <View style={styles.qtyItem}>
              <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>待审批PR</Text>
              <Text
                style={[
                  styles.qtyValue,
                  { color: item.pendingPrQty > 0 ? colors.warning : colors.textMuted },
                ]}
              >
                {formatQtyWithUnit(item.pendingPrQty, item.unit, unitLabelMap)}
              </Text>
            </View>
            <View style={styles.qtyItem}>
              <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>在产工单</Text>
              <Text
                style={[
                  styles.qtyValue,
                  { color: item.inProductionQty > 0 ? colors.success : colors.textMuted },
                ]}
              >
                {formatQtyWithUnit(item.inProductionQty, item.unit, unitLabelMap)}
              </Text>
            </View>
            <View style={styles.qtyItem}>
              <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>安全库存</Text>
              <Text style={[styles.qtyValue, { color: colors.text }]}>
                {formatQtyWithUnit(item.safetyStock, item.unit, unitLabelMap)}
              </Text>
            </View>
            <View style={styles.qtyItem}>
              <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>净需求</Text>
              <Text
                style={[
                  styles.qtyValue,
                  { color: item.netRequirement > 0 ? colors.error : colors.success },
                ]}
              >
                {formatQtyWithUnit(item.netRequirement, item.unit, unitLabelMap)}
              </Text>
            </View>
          </>
        )}
      </View>

      {item.suggestion !== 'sufficient' && (
        <View style={[styles.suggestRow, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.suggestText, { color: cfg.color }]}>
            {item.suggestion === 'customer_supply'
              ? '待客户供料'
              : `建议${item.suggestion === 'purchase' ? '采购' : '生产'}`}
            : {formatQtyWithUnit(item.suggestedQty, item.unit, unitLabelMap)}
          </Text>
          {calculationMode === 'net' && item.leadTimeDays != null && (
            <Text style={[styles.leadTime, { color: cfg.color }]}>
              前置期: {item.leadTimeDays}天
            </Text>
          )}
        </View>
      )}

      {/* 最晚下单日预警 */}
      {calculationMode === 'net' && item.latestOrderDate && (
        <View
          style={[
            styles.warningRow,
            {
              backgroundColor: item.leadTimeWarning ? `${colors.error}15` : `${colors.border}40`,
            },
          ]}
        >
          <Ionicons
            name={item.leadTimeWarning ? 'alert-circle' : 'calendar-outline'}
            size={14}
            color={item.leadTimeWarning ? colors.error : colors.textMuted}
          />
          <Text
            style={[
              styles.warningText,
              { color: item.leadTimeWarning ? colors.error : colors.textMuted },
            ]}
          >
            最晚下单日 {item.latestOrderDate}
            {item.leadTimeWarning ? ' · 已超期' : ''}
          </Text>
        </View>
      )}

      {/* 需求来源 Pegging（可展开） */}
      {canExpand && (
        <>
          <TouchableOpacity
            style={[styles.pegToggle, { borderTopColor: colors.border }]}
            onPress={() => setExpanded((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pegToggleText, { color: colors.textSecondary }]}>
              需求来源 ({item.sources.length})
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {expanded && (
            <View style={styles.pegList}>
              {item.sources.map((s) => (
                <View key={s.planId} style={styles.pegItem}>
                  <View style={styles.pegItemLeft}>
                    <Text style={[styles.pegPlanNo, { color: colors.text }]} numberOfLines={1}>
                      {s.planNo}
                    </Text>
                    <Text
                      style={[styles.pegPlanMaterial, { color: colors.textMuted }]}
                      numberOfLines={1}
                    >
                      {s.planMaterial}
                    </Text>
                    {formatCalculationSnapshots(s.calculationSnapshots).map((summary) => (
                      <Text
                        key={summary}
                        style={[styles.pegCalc, { color: colors.textMuted }]}
                        numberOfLines={1}
                      >
                        {summary}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.pegItemRight}>
                    <Text style={[styles.pegQty, { color: colors.text }]}>
                      {formatQtyWithUnit(s.qty, item.unit, unitLabelMap)}
                    </Text>
                    {calculationMode === 'net' && (s.shortageQty ?? 0) > 0 && (
                      <Text style={[styles.pegShortage, { color: colors.error }]}>
                        缺 {formatQtyWithUnit(s.shortageQty ?? 0, item.unit, unitLabelMap)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
              {supplyAllocations.length > 0 && (
                <>
                  <Text style={[styles.pegSectionTitle, { color: colors.textSecondary }]}>
                    供给配给（库存优先，其次执行中工单、采购订单、待审批采购申请）
                  </Text>
                  {supplyAllocations.map((allocation) => (
                    <View
                      key={`${allocation.sourceType}-${allocation.sourceWorkOrderId ?? allocation.sourcePlanId ?? allocation.demandPlanId ?? 'pool'}-${allocation.allocatedQty}-${allocation.consumedQty ?? 0}`}
                      style={styles.pegItem}
                    >
                      <View style={styles.pegItemLeft}>
                        <Text style={[styles.pegPlanNo, { color: colors.text }]}>
                          {getSupplySourceLabel(allocation.sourceType)}
                        </Text>
                        <Text style={[styles.pegPlanMaterial, { color: colors.textMuted }]}>
                          {allocation.sourceWorkOrderNo ??
                            allocation.sourcePlanNo ??
                            allocation.sourceWorkOrderId ??
                            allocation.sourcePlanId ??
                            '按供给池配给'}
                        </Text>
                        <Text style={[styles.pegPlanMaterial, { color: colors.textMuted }]}>
                          需求计划：{allocation.demandPlanNo ?? allocation.demandPlanId ?? '-'}
                        </Text>
                        <Text style={[styles.pegPlanMaterial, { color: colors.textMuted }]}>
                          状态：{getSupplyAllocationStatusLabel(allocation.status)} · 已消费{' '}
                          {formatQtyWithUnit(allocation.consumedQty ?? 0, item.unit, unitLabelMap)}
                        </Text>
                      </View>
                      <Text style={[styles.pegQty, { color: colors.text }]}>
                        {formatQtyWithUnit(allocation.allocatedQty, item.unit, unitLabelMap)}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        </>
      )}
    </ListCard>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  materialInfo: { flex: 1, marginRight: Spacing.sm },
  materialName: { fontSize: FontSize.sm, fontWeight: '600' },
  materialNo: { fontSize: FontSize.xs },
  suggestionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  suggestionText: { fontSize: FontSize.xs, fontWeight: '600' },
  stockRow: { marginVertical: Spacing.xs },
  stockTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  stockFill: { height: 6, borderRadius: 3 },
  qtyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  qtyItem: { minWidth: '30%' },
  qtyLabel: { fontSize: FontSize.xs, marginBottom: 2 },
  qtyValue: { fontSize: FontSize.sm, fontWeight: '500' },
  suggestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  suggestText: { fontSize: FontSize.sm, fontWeight: '500' },
  leadTime: { fontSize: FontSize.xs },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  warningText: { fontSize: FontSize.xs, fontWeight: '500' },
  pegToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 2,
  },
  pegToggleText: { fontSize: FontSize.xs },
  pegList: { gap: 6, marginTop: 4 },
  pegItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  pegItemLeft: { flex: 1, minWidth: 0 },
  pegItemRight: { alignItems: 'flex-end' },
  pegPlanNo: { fontSize: FontSize.xs, fontWeight: '500' },
  pegPlanMaterial: { fontSize: FontSize.xs },
  pegSectionTitle: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  pegCalc: { fontSize: FontSize.xs, marginTop: 2 },
  pegQty: { fontSize: FontSize.xs, fontWeight: '600' },
  pegShortage: { fontSize: FontSize.xs, fontWeight: '600' },
});
