import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { processRouteService } from '../../../host/services';
import type { ConvertInfoItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { PRODUCTION_FIELD_HELP } from '../../../constants/production-field-help';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { requestProductionBomSelectOptions } from '../../../utils/bom-options';
import { formatNumber } from '../../../../core/utils/format';
import { isManualSalesOrderStockNetting } from '../../../utils/production-plan-stock-netting';
import { formatUnitLabel, type UnitLabelMap } from '../../../utils/qty-unit';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductionConfigOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface ConvertItemRowProps {
  item: ConvertInfoItem;
  unitLabelMap: UnitLabelMap;
  selected: boolean;
  saleOrderId: string;
  routeSelectionDate?: string;
  quantityMode: 'rate-driven' | 'qty-driven';
  requiredQuantity: string;
  plannedQuantity: string;
  plannedLossRate: string;
  stockNettingReason: string;
  selectedBom: ProductionConfigOption | null;
  selectedRoute: ProductionConfigOption | null;
  onToggle: () => void;
  onBomChange: (bom: ProductionConfigOption | null) => void;
  onRouteChange: (route: ProductionConfigOption | null) => void;
  onRequiredQuantityChange: (qty: string) => void;
  onPlannedQuantityChange: (qty: string) => void;
  onPlannedLossRateChange: (rate: string) => void;
  onStockNettingReasonChange: (reason: string) => void;
}

function normalizeQtyInput(text: string): string {
  const cleaned = text.replace(/[^0-9.]/g, '');
  if (!cleaned) return '';

  const [integerPart = '', ...decimalParts] = cleaned.split('.');
  if (decimalParts.length === 0) return integerPart;

  return `${integerPart || '0'}.${decimalParts.join('')}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ConvertItemRow = React.memo(function ConvertItemRow({
  item,
  unitLabelMap,
  selected,
  saleOrderId,
  routeSelectionDate,
  quantityMode,
  requiredQuantity,
  plannedQuantity,
  plannedLossRate,
  stockNettingReason,
  selectedBom,
  selectedRoute,
  onToggle,
  onBomChange,
  onRouteChange,
  onRequiredQuantityChange,
  onPlannedQuantityChange,
  onPlannedLossRateChange,
  onStockNettingReasonChange,
}: ConvertItemRowProps) {
  const { colors } = useTheme();
  const materialUnitLabel = formatUnitLabel(item.materialUnit, unitLabelMap);
  const fullyConverted = item.remainingRequiredQty <= 0;
  const maxQty = Number(item.remainingRequiredQty);
  const requiredQtyNumber = Number(requiredQuantity || 0);
  const manualStockNettingRequired = isManualSalesOrderStockNetting(item, requiredQtyNumber);
  const hasStockPreview =
    !fullyConverted &&
    (item.decisionRequired || item.stockOffsetQty > 0 || item.currentStockQty > 0);
  const configMessages = [
    item.defaultBomStatus === 'conflict' ? (item.defaultBomMessage ?? 'BOM 配置冲突') : null,
    item.defaultRouteStatus === 'conflict'
      ? (item.defaultRouteMessage ?? '工艺路线配置冲突')
      : null,
    item.compatibilityStatus === 'conflict'
      ? (item.compatibilityMessage ?? 'BOM 与工艺路线不匹配')
      : null,
    ...(item.warnings ?? []),
  ].filter((message): message is string => Boolean(message));

  const fetchBomOptions = React.useCallback(
    (params: { page: number; pageSize: number; keyword?: string }) =>
      requestProductionBomSelectOptions({
        ...params,
        materialId: item.materialId,
        saleOrderId,
        saleOrderItemId: item.saleOrderItemId,
        fallbackMaterialName: item.materialName,
      }),
    [item.materialId, item.materialName, item.saleOrderItemId, saleOrderId],
  );

  const fetchRouteOptions = React.useCallback(
    async (params: { page: number; pageSize: number; keyword?: string }) => {
      const result = await processRouteService.listEffective({
        page: params.page,
        pageSize: params.pageSize,
        keyword: params.keyword,
        materialId: item.materialId,
        status: 'active',
        routeSelectionDate,
      });
      return {
        list: result.list.map((route) => ({
          id: route.id,
          label: `${route.code ? `${route.code} - ` : ''}${route.name}${
            (route.applicableMaterials?.length ?? 0) === 0 &&
            (route.applicableFamilies?.length ?? 0) === 0
              ? '（通用）'
              : ''
          }`,
          sublabel: `版本 ${route.version ?? '1.0'}`,
        })),
        total: result.total,
      };
    },
    [item.materialId, routeSelectionDate],
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, opacity: fullyConverted ? 0.5 : 1 },
      ]}
    >
      <TouchableOpacity
        style={[styles.checkRow, fullyConverted && styles.checkRowDisabled]}
        onPress={onToggle}
        disabled={fullyConverted}
        accessibilityState={{ disabled: fullyConverted }}
        accessibilityHint={fullyConverted ? '该明细已全部转入生产计划' : undefined}
        activeOpacity={0.7}
      >
        <Ionicons
          name={selected ? 'checkbox' : 'square-outline'}
          size={22}
          color={selected ? colors.primary : colors.textMuted}
        />
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            行 #{item.saleOrderItemLineNo} · {item.materialName}
          </Text>
          <Text style={[styles.code, { color: colors.textSecondary }]}>{item.materialCode}</Text>
          <Text
            style={[
              styles.code,
              { color: item.drawingCount > 0 ? colors.textSecondary : colors.warning },
            ]}
          >
            {item.drawingCount > 0 ? `订单图纸 ${item.drawingCount} 份` : '未关联订单图纸'}
          </Text>
          {fullyConverted ? (
            <Text style={[styles.code, { color: colors.textMuted }]}>已全部转生产计划</Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <View style={styles.qtyInfo}>
        <Text style={[styles.qtyLabel, { color: colors.textSecondary }]}>
          订单 {item.orderQty} {materialUnitLabel}
          {item.convertedRequiredQty > 0 && ` | 已转良品 ${item.convertedRequiredQty}`}
          {!fullyConverted && ` | 剩余良品 ${item.remainingRequiredQty}`}
        </Text>
        {fullyConverted && (
          <Text style={[styles.doneTag, { color: colors.success }]}>已全部转生产</Text>
        )}
      </View>

      {hasStockPreview && (
        <View style={[styles.stockBox, { backgroundColor: colors.background }]}>
          <Text style={[styles.stockLine, { color: colors.textSecondary }]}>
            可用库存{' '}
            {formatNumber(item.currentStockQty, { compact: false, maximumFractionDigits: 4 })}{' '}
            {materialUnitLabel} | 建议抵扣{' '}
            {formatNumber(item.stockOffsetQty, { compact: false, maximumFractionDigits: 4 })}{' '}
            {materialUnitLabel} | 建议生产{' '}
            {formatNumber(item.suggestedProductionQty, {
              compact: false,
              maximumFractionDigits: 4,
            })}{' '}
            {materialUnitLabel}
          </Text>
        </View>
      )}

      {(selectedBom || selectedRoute || configMessages.length > 0) && (
        <View style={[styles.configBox, { borderColor: colors.border }]}>
          <Text style={[styles.configLine, { color: colors.textSecondary }]} numberOfLines={1}>
            BOM：{selectedBom?.label ?? item.defaultBomMessage ?? '未匹配'}
          </Text>
          <Text style={[styles.configLine, { color: colors.textSecondary }]} numberOfLines={1}>
            路线：{selectedRoute?.label ?? item.defaultRouteMessage ?? '未匹配'}
          </Text>
          {configMessages.map((message) => (
            <Text
              key={message}
              style={[
                styles.configWarning,
                {
                  color:
                    item.compatibilityStatus === 'conflict' ||
                    item.defaultBomStatus === 'conflict' ||
                    item.defaultRouteStatus === 'conflict'
                      ? colors.error
                      : colors.warning,
                },
              ]}
            >
              {message}
            </Text>
          ))}
        </View>
      )}

      {selected && !fullyConverted && (
        <View style={styles.inputRow}>
          <EntityPickerField<ProductionConfigOption>
            label="BOM版本"
            help={PRODUCTION_FIELD_HELP.bomHeaderId}
            value={selectedBom}
            onChange={onBomChange}
            fetchFn={fetchBomOptions}
            keyExtractor={(bom) => bom.id}
            labelExtractor={(bom) => bom.label}
            sublabelExtractor={(bom) => bom.sublabel ?? ''}
            placeholder="系统默认"
            title="选择BOM版本"
            containerStyle={styles.inputField}
            clearable
          />
          <EntityPickerField<ProductionConfigOption>
            label="工艺路线"
            help={PRODUCTION_FIELD_HELP.routeId}
            value={selectedRoute}
            onChange={onRouteChange}
            fetchFn={fetchRouteOptions}
            keyExtractor={(route) => route.id}
            labelExtractor={(route) => route.label}
            sublabelExtractor={(route) => route.sublabel ?? ''}
            placeholder="系统默认"
            title="选择工艺路线"
            containerStyle={styles.inputField}
            clearable
          />
          <FormField
            label="需求良品数"
            help={PRODUCTION_FIELD_HELP.requiredQty}
            value={requiredQuantity}
            onChangeText={(text) => {
              const normalized = normalizeQtyInput(text);
              if (!normalized) {
                onRequiredQuantityChange('');
                return;
              }

              const qty = Number(normalized);
              if (!Number.isNaN(qty) && qty > maxQty) {
                onRequiredQuantityChange(String(maxQty));
                return;
              }
              onRequiredQuantityChange(normalized);
            }}
            keyboardType="decimal-pad"
            placeholder={`最多 ${item.remainingRequiredQty}`}
            containerStyle={styles.inputField}
            rightElement={
              <Text style={[styles.unit, { color: colors.textSecondary }]}>
                {materialUnitLabel}
              </Text>
            }
          />
          <FormField
            label="补量率(%)"
            help={PRODUCTION_FIELD_HELP.plannedLossRate}
            value={plannedLossRate}
            onChangeText={(text) => onPlannedLossRateChange(normalizeQtyInput(text))}
            keyboardType="decimal-pad"
            placeholder="默认 0"
            containerStyle={styles.inputField}
          />
          <FormField
            label={quantityMode === 'qty-driven' ? '投产数量' : '投产数量（按补量率自动算）'}
            help={PRODUCTION_FIELD_HELP.plannedQty}
            value={plannedQuantity}
            onChangeText={(text) => onPlannedQuantityChange(normalizeQtyInput(text))}
            keyboardType="decimal-pad"
            placeholder="请输入投产数量"
            containerStyle={styles.inputField}
            rightElement={
              <Text style={[styles.unit, { color: colors.textSecondary }]}>
                {materialUnitLabel}
              </Text>
            }
          />
          {manualStockNettingRequired && (
            <FormField
              label="手工指定净需求原因"
              required
              value={stockNettingReason}
              onChangeText={onStockNettingReasonChange}
              placeholder="说明为什么不完全按系统建议净需求生产"
              multiline
              numberOfLines={2}
              containerStyle={styles.inputField}
            />
          )}
        </View>
      )}
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    borderRadius: Radius.md,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkRowDisabled: {
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs,
  },
  info: { flex: 1, gap: 2 },
  name: { fontSize: FontSize.sm, fontWeight: '600' },
  code: { fontSize: FontSize.xs },
  qtyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 30,
  },
  qtyLabel: { fontSize: FontSize.xs },
  doneTag: { fontSize: FontSize.xs, fontWeight: '600' },
  configBox: {
    marginLeft: 30,
    paddingLeft: Spacing.sm,
    borderLeftWidth: 2,
    gap: 2,
  },
  stockBox: {
    marginLeft: 30,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  stockLine: { fontSize: FontSize.xs, lineHeight: 18 },
  configLine: { fontSize: FontSize.xs },
  configWarning: { fontSize: FontSize.xs },
  inputRow: {
    paddingLeft: 30,
    gap: Spacing.xs,
  },
  inputField: { maxWidth: 240 },
  unit: { fontSize: FontSize.xs },
});
