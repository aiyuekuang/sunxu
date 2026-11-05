import { StyleSheet, View } from 'react-native';
import type { MaterialEffectiveProfileDto } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { DetailCard, InfoRow } from '../../../../core/components/DetailCard.tsx';
import { OPERATION_FEATURE } from '../../../host/authorization';
import {
  MATERIAL_EFFECTIVE_SOURCE_CONFIG,
  MATERIAL_FAMILY_BATCH_STRATEGY_CONFIG,
  PROCUREMENT_TYPE_CONFIG,
} from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useOperationFeatureVisibility } from '../../../host/hooks/useOperationFeatureVisibility';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatUnitLabel } from '../../../utils/qty-unit';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EffectiveProfileSectionProps {
  /** 后端解析后的有效物料画像 */
  profile: MaterialEffectiveProfileDto;
  /** 可见权限内加载到的默认仓库名称 */
  defaultWarehouseName?: string | null;
  /** 可见权限内加载到的默认完工入库仓名称 */
  defaultProductionReceiptWarehouseName?: string | null;
  /** 物料详情关联里的默认供应商名称 */
  defaultSupplierName?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatOptional(value?: string | number | null): string {
  return value === null || value === undefined || value === '' ? '-' : String(value);
}

function formatFamily(profile: MaterialEffectiveProfileDto): string {
  if (!profile.familyName && !profile.familyCode) return '-';
  return [profile.familyName, profile.familyCode].filter(Boolean).join(' / ');
}

function formatCategory(profile: MaterialEffectiveProfileDto): string {
  if (!profile.categoryName && !profile.categoryCode) return '-';
  return [profile.categoryName, profile.categoryCode].filter(Boolean).join(' / ');
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EffectiveProfileSection({
  profile,
  defaultWarehouseName,
  defaultProductionReceiptWarehouseName,
  defaultSupplierName,
}: EffectiveProfileSectionProps) {
  const { colors } = useTheme();
  const materialFamilyManagementVisible = useOperationFeatureVisibility(
    OPERATION_FEATURE.MATERIAL_FAMILY_MANAGEMENT,
  );
  const { labelMap: unitLabelMap } = useUnitDisplay('material');

  const renderValueWithSource = (
    label: string,
    value: string | number | null | undefined,
    sourceKey: string,
  ) => (
    <InfoRow
      label={label}
      right={
        <View style={styles.valueWithSource}>
          <Text style={[styles.valueText, { color: colors.text }]} numberOfLines={2}>
            {formatOptional(value)}
          </Text>
          <ConfigBadge
            value={profile.fieldSources[sourceKey] ?? 'snapshot'}
            config={MATERIAL_EFFECTIVE_SOURCE_CONFIG}
            size="sm"
          />
        </View>
      }
    />
  );

  return (
    <DetailCard title="有效配置">
      {materialFamilyManagementVisible
        ? renderValueWithSource('所属物料系列', formatFamily(profile), 'familyId')
        : null}
      {renderValueWithSource('业务分类', formatCategory(profile), 'categoryId')}
      {renderValueWithSource('库存基础单位', formatUnitLabel(profile.unit, unitLabelMap), 'unit')}
      {renderValueWithSource(
        '默认采购单位',
        formatUnitLabel(profile.defaultPurchaseUnit, unitLabelMap),
        'defaultPurchaseUnit',
      )}
      {renderValueWithSource(
        '默认生产/BOM单位',
        formatUnitLabel(profile.defaultProductionUnit, unitLabelMap),
        'defaultProductionUnit',
      )}
      <InfoRow
        label="采购类型"
        right={
          <ConfigBadge value={profile.procurementType} config={PROCUREMENT_TYPE_CONFIG} size="sm" />
        }
      />
      {renderValueWithSource(
        '默认仓库（常规）',
        defaultWarehouseName ?? profile.defaultWarehouseId,
        'defaultWarehouseId',
      )}
      {renderValueWithSource(
        '默认完工入库仓',
        defaultProductionReceiptWarehouseName ?? profile.defaultProductionReceiptWarehouseId,
        'defaultProductionReceiptWarehouseId',
      )}
      {renderValueWithSource(
        '默认供应商',
        defaultSupplierName ?? profile.defaultSupplierId,
        'defaultSupplierId',
      )}
      <InfoRow
        label="批号策略"
        right={
          profile.defaultBatchStrategy ? (
            <ConfigBadge
              value={profile.defaultBatchStrategy}
              config={MATERIAL_FAMILY_BATCH_STRATEGY_CONFIG}
              size="sm"
            />
          ) : null
        }
      />
      <InfoRow label="批号追踪" value={profile.hasBatchTracking ? '已启用' : '未启用'} />
      {profile.warnings.length > 0 ? (
        <View style={[styles.warningBox, { backgroundColor: colors.warningSurface }]}>
          {profile.warnings.map((warning) => (
            <Text key={warning} style={[styles.warningText, { color: colors.warning }]}>
              {warning}
            </Text>
          ))}
        </View>
      ) : null}
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  valueWithSource: {
    flex: 1,
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  valueText: {
    fontSize: FontSize.base,
    fontWeight: '500',
    textAlign: 'right',
  },
  warningBox: {
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  warningText: {
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
});
