import type React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Material } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { DetailCard, InfoRow } from '../../../../core/components/DetailCard.tsx';
import {
  ACTIVE_STATUS_CONFIG,
  MATERIAL_BASE_TYPE_CONFIG,
  PROCUREMENT_TYPE_CONFIG,
} from '../../../constants/status-configs';
import { FontSize, FontWeight, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatDateTime, formatDuration } from '../../../../core/utils/date';
import { formatQtyWithUnit, formatUnitLabel, type UnitLabelMap } from '../../../utils/qty-unit';

interface MaterialArchiveSectionsProps {
  material: Material;
  defaultWarehouseName?: string | null;
  defaultProductionReceiptWarehouseName?: string | null;
  defaultSupplierName?: string | null;
  canViewPrices: boolean;
  maskAmount: (amount: string) => string;
}

type MaterialWithBomUsageFormula = Material & {
  bomUsageFormula?: string | null;
};

interface InfoItem {
  key: string;
  label: string;
  value?: string | number | null;
  right?: React.ReactNode;
  visible?: boolean;
}

function hasBusinessCategory(
  material: Pick<Material, 'baseType' | 'type' | 'categoryId' | 'materialCategory'>,
): boolean {
  if (material.materialCategory) {
    return material.materialCategory.isSystem === false;
  }
  return Boolean(
    material.baseType &&
    material.categoryId &&
    material.type &&
    material.type !== material.baseType,
  );
}

function getBusinessCategoryName(
  material: Pick<Material, 'baseType' | 'type' | 'categoryId' | 'category' | 'materialCategory'>,
): string {
  if (material.materialCategory?.isSystem === false) {
    return material.materialCategory.name;
  }
  return hasBusinessCategory(material) ? (material.category ?? '-') : '-';
}

function getBusinessCategoryCode(
  material: Pick<Material, 'baseType' | 'type' | 'categoryId' | 'materialCategory'>,
): string {
  if (material.materialCategory?.isSystem === false) {
    return material.materialCategory.code;
  }
  return hasBusinessCategory(material) ? material.type || '-' : '-';
}

function formatQuantity(
  value: number | null | undefined,
  unit: string | null | undefined,
  unitLabelMap: UnitLabelMap,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return formatQtyWithUnit(value, unit, unitLabelMap);
}

function renderRows(rows: InfoItem[]) {
  const visibleRows = rows.filter((row) => row.visible !== false);
  return visibleRows.map((row, index) => (
    <InfoRow
      key={row.key}
      label={row.label}
      value={row.value}
      right={row.right}
      last={index === visibleRows.length - 1}
    />
  ));
}

export function MaterialArchiveSections({
  material,
  defaultWarehouseName,
  defaultProductionReceiptWarehouseName,
  defaultSupplierName,
  canViewPrices,
  maskAmount,
}: MaterialArchiveSectionsProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const baseUnitLabel = formatUnitLabel(material.unit, unitLabelMap);
  const bomUsageFormula = (material as MaterialWithBomUsageFormula).bomUsageFormula?.trim();

  return (
    <>
      <DetailCard noPadding style={styles.summaryCard}>
        <View style={styles.summaryBody}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitleGroup}>
              <Text style={[styles.summaryCode, { color: colors.textSecondary }]}>
                {material.code}
              </Text>
              <Text style={[styles.summaryTitle, { color: colors.text }]} numberOfLines={2}>
                {material.name}
              </Text>
            </View>
            <ConfigBadge
              value={material.isActive ? 'active' : 'inactive'}
              config={ACTIVE_STATUS_CONFIG}
              size="sm"
            />
          </View>
          <Text style={[styles.summarySpec, { color: colors.textSecondary }]} numberOfLines={2}>
            {material.spec || '未维护规格型号'}
          </Text>
          <View style={styles.summaryBadges}>
            {material.baseType ? (
              <ConfigBadge value={material.baseType} config={MATERIAL_BASE_TYPE_CONFIG} size="sm" />
            ) : null}
            <ConfigBadge
              value={material.procurementType}
              config={PROCUREMENT_TYPE_CONFIG}
              size="sm"
            />
            <View style={[styles.unitBadge, { backgroundColor: colors.background }]}>
              <Text style={[styles.unitBadgeText, { color: colors.textSecondary }]}>
                {baseUnitLabel || '-'}
              </Text>
            </View>
          </View>
        </View>
      </DetailCard>

      <DetailCard title="分类与来源">
        {renderRows([
          {
            key: 'baseType',
            label: '系统分类',
            right: material.baseType ? (
              <ConfigBadge value={material.baseType} config={MATERIAL_BASE_TYPE_CONFIG} size="sm" />
            ) : undefined,
            value: material.baseType ? undefined : '-',
          },
          {
            key: 'procurementType',
            label: '采购类型',
            right: (
              <ConfigBadge
                value={material.procurementType}
                config={PROCUREMENT_TYPE_CONFIG}
                size="sm"
              />
            ),
          },
          { key: 'categoryName', label: '业务分类', value: getBusinessCategoryName(material) },
          { key: 'categoryCode', label: '分类编码', value: getBusinessCategoryCode(material) },
        ])}
      </DetailCard>

      <DetailCard title="规格与单位">
        {renderRows([
          { key: 'spec', label: '规格型号', value: material.spec ?? '-' },
          { key: 'unit', label: '库存基础单位', value: baseUnitLabel || '-' },
          {
            key: 'purchaseUnit',
            label: '默认采购单位',
            value: formatUnitLabel(material.defaultPurchaseUnit, unitLabelMap) || '-',
          },
          {
            key: 'productionUnit',
            label: '默认生产/BOM单位',
            value: formatUnitLabel(material.defaultProductionUnit, unitLabelMap) || '-',
          },
          {
            key: 'bomUsageFormula',
            label: 'BOM用量公式',
            value: bomUsageFormula,
            visible: Boolean(bomUsageFormula),
          },
          { key: 'barcode', label: '条形码', value: material.barcode ?? '-' },
        ])}
      </DetailCard>

      <DetailCard title="库存与采购参数">
        {renderRows([
          {
            key: 'batchTracking',
            label: '批号追踪',
            value: material.hasBatchTracking ? '已启用' : '未启用',
          },
          {
            key: 'safetyStock',
            label: '安全库存',
            value: formatQuantity(material.safetyStock, material.unit, unitLabelMap),
            visible: material.safetyStock != null,
          },
          {
            key: 'minOrderQty',
            label: '最小采购量',
            value: formatQuantity(material.minOrderQty, material.unit, unitLabelMap),
            visible: material.minOrderQty != null,
          },
          {
            key: 'supplyMultipleQty',
            label: '供应倍量',
            value: formatQuantity(
              material.supplyMultipleQty,
              material.defaultProductionUnit ?? material.unit,
              unitLabelMap,
            ),
            visible: material.supplyMultipleQty != null && material.supplyMultipleQty > 1,
          },
          {
            key: 'productionQtyRoundingMode',
            label: '投产数量取整',
            value:
              material.productionQtyRoundingMode === 'ceil_integer' ? '向上取整到整数' : '不取整',
            visible: material.procurementType === 'make' || material.procurementType === 'both',
          },
          {
            key: 'defaultWarehouse',
            label: '默认仓库（常规）',
            value: defaultWarehouseName,
            visible: Boolean(defaultWarehouseName),
          },
          {
            key: 'defaultProductionReceiptWarehouse',
            label: '默认完工入库仓',
            value: defaultProductionReceiptWarehouseName,
            visible: Boolean(defaultProductionReceiptWarehouseName),
          },
          {
            key: 'defaultSupplier',
            label: '默认供应商',
            value: defaultSupplierName,
            visible: Boolean(defaultSupplierName),
          },
          {
            key: 'shelfLifeDays',
            label: '保质期',
            value: `${material.shelfLifeDays} 天`,
            visible: material.shelfLifeDays != null,
          },
          {
            key: 'leadTimeDays',
            label: '采购提前期',
            value: `${material.leadTimeDays} 天`,
            visible: material.leadTimeDays != null,
          },
          {
            key: 'manufacturingLeadTimeMinutes',
            label: '生产提前期',
            value:
              material.manufacturingLeadTimeMinutes != null
                ? formatDuration(material.manufacturingLeadTimeMinutes)
                : null,
            visible: material.manufacturingLeadTimeMinutes != null,
          },
        ])}
      </DetailCard>

      {canViewPrices && (material.unitCost != null || material.referenceSalePrice != null) ? (
        <DetailCard title="价格信息">
          {renderRows([
            {
              key: 'unitCost',
              label: '单位成本',
              value: maskAmount(`¥${material.unitCost}`),
              visible: material.unitCost != null,
            },
            {
              key: 'referenceSalePrice',
              label: '参考售价',
              value: maskAmount(`¥${material.referenceSalePrice}`),
              visible: material.referenceSalePrice != null,
            },
          ])}
        </DetailCard>
      ) : null}

      <DetailCard title="备注与审计">
        {renderRows([
          {
            key: 'description',
            label: '描述',
            value: material.description,
            visible: Boolean(material.description),
          },
          { key: 'createdAt', label: '创建时间', value: formatDateTime(material.createdAt) },
        ])}
      </DetailCard>
    </>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: Radius.md,
  },
  summaryBody: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  summaryTitleGroup: {
    flex: 1,
    gap: 2,
  },
  summaryCode: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  summaryTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    lineHeight: 24,
  },
  summarySpec: {
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  summaryBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  unitBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  unitBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
