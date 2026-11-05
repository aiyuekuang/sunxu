import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { StockCountLine } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { INVENTORY_OWNER_TYPE_CONFIG } from '../../../constants/status-configs';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatNumber, roundNumber } from '../../../../core/utils/format';
import { buildMaterialIdentitySublabel } from '../../../utils/material-identity';

export interface LineEntry {
  actualQty: string;
  remarks: string;
}

interface StockCountLineRowProps {
  line: StockCountLine;
  /** 本地录入态；undefined 表示尚未编辑，回退到服务端已存值 */
  entry?: LineEntry;
  editable: boolean;
  showBookQty: boolean;
  showDifference: boolean;
  showDivider: boolean;
  canRemove?: boolean;
  onChangeQty: (lineId: string, text: string) => void;
  onChangeRemarks: (lineId: string, text: string) => void;
  onRemove?: (line: StockCountLine) => void;
}

const toNum = (v: number | string | null | undefined): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function formatVariance(variance: number | null): string {
  if (variance == null) return '-';
  const value = formatNumber(variance, { fallback: '0', maximumFractionDigits: 4 });
  return variance > 0 ? `+${value}` : value;
}

/**
 * 单条盘点行 —— React.memo 只在自身 line/entry 变化时重渲染。
 * 大仓数百行逐行录入时，敲一行不再触发整列重渲染。
 */
export const StockCountLineRow = React.memo(function StockCountLineRow({
  line,
  entry,
  editable,
  showBookQty,
  showDifference,
  showDivider,
  canRemove = false,
  onChangeQty,
  onChangeRemarks,
  onRemove,
}: StockCountLineRowProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const actualStr = entry?.actualQty ?? (line.actualQty != null ? String(line.actualQty) : '');
  const remarksStr = entry?.remarks ?? line.remarks ?? '';
  const actualNum = actualStr.trim() === '' ? null : Number(actualStr);
  const variance = showDifference
    ? actualNum != null && Number.isFinite(actualNum)
      ? roundNumber(actualNum - toNum(line.bookQty), 4)
      : line.varianceQty != null
        ? roundNumber(toNum(line.varianceQty), 4)
        : null
    : null;
  const varianceColor =
    variance == null || Math.abs(variance) < 1e-9
      ? colors.textSecondary
      : variance > 0
        ? colors.success
        : colors.error;

  return (
    <View
      style={[
        styles.row,
        showDivider && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.headingRow}>
        <Text style={[styles.material, { color: colors.text }]} numberOfLines={2}>
          {line.material?.name ?? line.materialId}
        </Text>
        {canRemove && onRemove ? (
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: colors.errorSurface }]}
            onPress={() => onRemove(line)}
            activeOpacity={0.72}
            accessibilityRole="button"
            accessibilityLabel={`删除${line.material?.name ?? '盘点'}行`}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={[styles.removeText, { color: colors.error }]}>删除</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {line.material ? (
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={2}>
          {buildMaterialIdentitySublabel(line.material, unitLabelMap)}
        </Text>
      ) : null}
      <View style={styles.metaRow}>
        <ConfigBadge value={line.ownerType} config={INVENTORY_OWNER_TYPE_CONFIG} size="sm" />
        {line.batchNo ? (
          <Text style={[styles.meta, { color: colors.textSecondary }]}>批号 {line.batchNo}</Text>
        ) : null}
        {showBookQty ? (
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            账面 {formatNumber(toNum(line.bookQty), { fallback: '0', maximumFractionDigits: 4 })}
          </Text>
        ) : null}
        {showDifference ? (
          <Text style={[styles.meta, { color: varianceColor }]}>
            差异 {formatVariance(variance)}
          </Text>
        ) : null}
      </View>

      {editable ? (
        <View style={styles.entryRow}>
          <View style={styles.qty}>
            <FormField
              label="实盘数量"
              value={actualStr}
              onChangeText={(t) => onChangeQty(line.id, t)}
              placeholder="0"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.remarks}>
            <FormField
              label="差异原因"
              value={remarksStr}
              onChangeText={(t) => onChangeRemarks(line.id, t)}
              placeholder={showDifference ? '有差异必填' : '现场备注（选填）'}
            />
          </View>
        </View>
      ) : (
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: colors.text }]}>
            实盘{' '}
            {line.actualQty != null
              ? formatNumber(toNum(line.actualQty), { fallback: '0', maximumFractionDigits: 4 })
              : '-'}
          </Text>
          {line.remarks ? (
            <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
              原因 {line.remarks}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { paddingVertical: Spacing.sm, gap: Spacing.xs },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  material: { flex: 1, fontSize: FontSize.sm, fontWeight: '600' },
  removeButton: {
    minHeight: 48,
    minWidth: 44,
    paddingHorizontal: Spacing.sm,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeText: { fontSize: FontSize.xs, fontWeight: '600' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  meta: { fontSize: FontSize.xs },
  entryRow: { flexDirection: 'row', gap: Spacing.sm },
  qty: { flex: 1 },
  remarks: { flex: 1.4 },
});
