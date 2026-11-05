import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { workOrderService } from '../../../host/services';
import { ProcessRouteListDto } from '../../../types/models/ProcessRouteListDto';
import type { BomHeader } from '../../../host/services';
import { type ProcessRoute, processRouteService } from '../../../host/services';
import type { Warehouse } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { WarehousePickerField } from '../../../components/common/WarehousePickerField.tsx';
import { ProductionBomPickerField } from '../../../components/common/ProductionBomPickerField.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';
import {
  getReceiptWarehouseFamiliesByMaterialType,
  getReceiptWarehouseHintByMaterialType,
} from '../receipt-warehouse-policy';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductionConfigSectionProps {
  workOrderId: string;
  materialId: string;
  materialBaseType?: string | null;
  saleOrderId?: string | null;
  saleOrderItemId?: string | null;
  bomHeader: BomHeader | null;
  route: ProcessRoute | null;
  routeSelectionDate?: string | null;
  receiptWarehouse: Warehouse | null;
  editable: boolean;
  routeEditable?: boolean;
  receiptWarehouseEditable?: boolean;
  onUpdated: () => void;
}

const BOM_SOURCE_LABEL: Record<string, string> = {
  standard: '标准 BOM',
};

function getUrlArrayLength(item: Record<string, unknown>, key: string): number {
  const value = item[key];
  return Array.isArray(value) ? value.length : 0;
}

function getBomAttachmentCount(bomHeader: BomHeader | null): { drawings: number; images: number } {
  const items = bomHeader?.items ?? [];
  return items.reduce<{ drawings: number; images: number }>(
    (acc, item) => ({
      drawings: acc.drawings + getUrlArrayLength(item, 'drawingUrls'),
      images: acc.images + getUrlArrayLength(item, 'imageUrls'),
    }),
    { drawings: 0, images: 0 },
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductionConfigSection({
  workOrderId,
  materialId,
  materialBaseType,
  saleOrderId,
  saleOrderItemId,
  bomHeader,
  route,
  routeSelectionDate,
  receiptWarehouse,
  editable,
  routeEditable = editable,
  receiptWarehouseEditable = false,
  onUpdated,
}: ProductionConfigSectionProps) {
  const { colors } = useTheme();
  const [saving, setSaving] = useState(false);

  const fetchRoutes = useCallback(
    (p: { page: number; pageSize: number; keyword?: string }) =>
      processRouteService.listEffective({
        ...p,
        materialId,
        status: ProcessRouteListDto.status.ACTIVE,
        routeSelectionDate: routeSelectionDate ?? undefined,
      }),
    [materialId, routeSelectionDate],
  );

  const handleUpdate = async (
    field: 'bomHeaderId' | 'routeId' | 'receiptWarehouseId',
    value: string | undefined,
  ) => {
    setSaving(true);
    try {
      await workOrderService.update({ id: workOrderId, [field]: value ?? null });
      toast.success('已更新');
      onUpdated();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const hasBom = !!bomHeader;
  const hasRoute = !!route;
  const needsConfig = !hasBom && !hasRoute;
  const bomAttachmentCount = getBomAttachmentCount(bomHeader);
  // 来源摘要只读后端给人读的 sourceSummaryText（机器签名 sourceSummary 已不再返回）；
  // 为空时直接不渲染该行，避免把内部签名/对象原样透传给一线用户。
  const bomSourceSummary = bomHeader?.sourceSummaryText ?? null;
  const bomMetaRows = bomHeader
    ? [
        { label: 'BOM来源', value: BOM_SOURCE_LABEL[bomHeader.sourceType] ?? bomHeader.sourceType },
        ...(bomAttachmentCount.drawings + bomAttachmentCount.images > 0
          ? [
              {
                label: '图纸/图片',
                value: `${bomAttachmentCount.drawings} 图纸 / ${bomAttachmentCount.images} 图片`,
              },
            ]
          : []),
        ...(bomSourceSummary ? [{ label: '来源摘要', value: bomSourceSummary }] : []),
      ]
    : [];

  return (
    <DetailCard title="生产配置">
      {editable ? (
        <View style={{ gap: Spacing.sm }}>
          {needsConfig && (
            <View style={[styles.hint, { backgroundColor: `${colors.warning}18` }]}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.warning} />
              <Text style={[styles.hintText, { color: colors.warning }]}>
                下达前需配置 BOM 或工艺路线
              </Text>
            </View>
          )}
          <ProductionBomPickerField
            label="BOM 版本"
            value={bomHeader}
            onChange={(v) => handleUpdate('bomHeaderId', v?.id)}
            placeholder="选择 BOM"
            materialId={materialId}
            saleOrderId={saleOrderId}
            saleOrderItemId={saleOrderItemId}
            fallbackMaterialName={bomHeader?.material?.name}
            disabled={saving}
          />
          {bomMetaRows.map((row) => (
            <Row key={row.label} label={row.label} value={row.value} />
          ))}
          {routeEditable ? (
            <EntityPickerField<ProcessRoute>
              label="工艺路线"
              value={route}
              onChange={(v) => handleUpdate('routeId', v?.id)}
              fetchFn={fetchRoutes}
              keyExtractor={(r) => r.id}
              labelExtractor={(r) => `${r.code} - ${r.name}`}
              sublabelExtractor={(r) => `版本 ${r.version ?? 'V1'}`}
              placeholder="选择工艺路线"
              clearable
              disabled={saving}
            />
          ) : (
            <Row label="工艺路线" value={route ? `${route.code} - ${route.name}` : '-'} />
          )}
          {receiptWarehouseEditable ? (
            <WarehousePickerField
              label="入库仓库"
              value={receiptWarehouse}
              onChange={(v) => handleUpdate('receiptWarehouseId', v?.id)}
              pickerOptions={{
                typeFamilies: getReceiptWarehouseFamiliesByMaterialType(materialBaseType),
              }}
              placeholder={getReceiptWarehouseHintByMaterialType(materialBaseType)}
              clearable
              disabled={saving}
            />
          ) : (
            <Row label="入库仓库" value={receiptWarehouse?.name ?? '-'} />
          )}
        </View>
      ) : (
        <View style={{ gap: Spacing.xs }}>
          <Row
            label="BOM"
            value={
              bomHeader
                ? [bomHeader.bomMaster?.name, `版本 ${bomHeader.version}`]
                    .filter(Boolean)
                    .join(' / ')
                : '-'
            }
          />
          {bomMetaRows.map((row) => (
            <Row key={row.label} label={row.label} value={row.value} />
          ))}
          <Row label="工艺路线" value={route ? `${route.code} - ${route.name}` : '-'} />
          <Row label="入库仓库" value={receiptWarehouse?.name ?? '-'} />
        </View>
      )}
    </DetailCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.lg,
  },
  hintText: { fontSize: FontSize.xs, fontWeight: '500' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: FontSize.sm },
  rowValue: { fontSize: FontSize.sm, fontWeight: '500' },
});
