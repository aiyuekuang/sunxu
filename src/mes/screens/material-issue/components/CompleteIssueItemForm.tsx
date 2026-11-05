import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { InventoryOwnerType } from '../../../types/models/InventoryOwnerType';
import type { Material } from '../../../types/models/Material';
import type { MaterialIssueItem } from '../../../types/models/MaterialIssueItem';
import type { MaterialReq } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { type ChipOption, ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { ExistingBatchPickerField } from '../../../components/common/ExistingBatchPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import {
  type SelectedStockLocation,
  StockLocationField,
} from '../../warehouse/components/StockLocationField.tsx';
import {
  WarehouseCandidateField,
  type WarehouseCandidateOption,
} from '../../warehouse/components/WarehouseCandidateField.tsx';
import { formatUnitLabel } from '../../../utils/qty-unit';
import {
  convertCompleteIssueQtyToUnit,
  formatCompleteIssueQtyInput,
  resolveCompleteIssueBaseQty,
} from '../utils/completeIssueQuantity';
import { getMaterialReqOwnerRefId, getMaterialReqOwnerType } from '../utils/materialReqOwner';

export interface CompleteIssueItemDraft {
  id: string;
  materialId: string;
  material?: Material;
  materialReq?: MaterialReq | null;
  materialCode: string;
  materialName: string;
  requiredQty: number;
  baseUnit: string;
  issueQty: string;
  issueUnit: string;
  warehouseId: string;
  batchNo: string;
  location: SelectedStockLocation | null;
  storageLocation: string;
  gradeExceptionReason: string;
  overIssueReason: string;
  locationRequired: boolean;
}

interface CompleteIssueItemFormProps {
  item: CompleteIssueItemDraft;
  index: number;
  candidates: WarehouseCandidateOption[];
  loadingStock: boolean;
  stockError?: string;
  unitFactors?: Record<string, number>;
  loadingUnitFactors: boolean;
  unitFactorError?: string;
  error?: string;
  onChange: (index: number, patch: Partial<CompleteIssueItemDraft>) => void;
}

export function CompleteIssueItemForm({
  item,
  index,
  candidates,
  loadingStock,
  stockError,
  unitFactors,
  loadingUnitFactors,
  unitFactorError,
  error,
  onChange,
}: CompleteIssueItemFormProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const baseUnitLabel = formatUnitLabel(item.baseUnit, unitLabelMap);
  const issueUnitLabel = formatUnitLabel(item.issueUnit, unitLabelMap);
  const issueBaseQty = resolveCompleteIssueBaseQty(
    item.issueQty,
    item.issueUnit,
    item.baseUnit,
    unitFactors,
  );
  const unitOptions = useMemo<ChipOption[]>(() => {
    const units = Object.keys(unitFactors ?? { [item.baseUnit]: 1 });
    if (item.issueUnit && !units.includes(item.issueUnit)) {
      units.unshift(item.issueUnit);
    }
    return units.map((unit) => ({
      value: unit,
      label: formatUnitLabel(unit, unitLabelMap),
    }));
  }, [item.baseUnit, item.issueUnit, unitFactors, unitLabelMap]);
  const ownerType = getMaterialReqOwnerType(item.materialReq);
  const ownerRefId = getMaterialReqOwnerRefId(item.materialReq);
  const selectedWarehouse = useMemo(
    () => candidates.find((candidate) => candidate.warehouse.id === item.warehouseId),
    [candidates, item.warehouseId],
  );
  const handleLocationChange = useCallback(
    (location: SelectedStockLocation | null) => onChange(index, { location }),
    [index, onChange],
  );
  const handleStorageLocationChange = useCallback(
    (storageLocation: string) => onChange(index, { storageLocation }),
    [index, onChange],
  );
  const handleLocationRequirementChange = useCallback(
    (locationRequired: boolean) => {
      if (locationRequired !== item.locationRequired) {
        onChange(index, { locationRequired });
      }
    },
    [index, item.locationRequired, onChange],
  );
  const handleIssueUnitChange = useCallback(
    (issueUnit: string) => {
      const baseQty =
        issueBaseQty ??
        resolveCompleteIssueBaseQty(item.requiredQty, item.baseUnit, item.baseUnit, unitFactors);
      const convertedQty =
        baseQty === null
          ? null
          : convertCompleteIssueQtyToUnit(baseQty, issueUnit, item.baseUnit, unitFactors);
      onChange(index, {
        issueUnit,
        issueQty: convertedQty === null ? item.issueQty : formatCompleteIssueQtyInput(convertedQty),
      });
    },
    [index, issueBaseQty, item.baseUnit, item.issueQty, item.requiredQty, onChange, unitFactors],
  );

  return (
    <View style={[styles.container, { borderColor: error ? colors.error : colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>明细 #{index + 1}</Text>
        <Text style={[styles.requiredQty, { color: colors.textSecondary }]}>
          需求 {item.requiredQty}
          {baseUnitLabel ? ` ${baseUnitLabel}` : ''}
        </Text>
      </View>
      <Text style={[styles.material, { color: colors.primary }]}>
        {item.materialCode} · {item.materialName}
      </Text>
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

      <QuickNumInput
        label="实发数量"
        required
        value={item.issueQty}
        onChangeText={(issueQty) => onChange(index, { issueQty })}
        min={0}
        clampToBounds={false}
        unit={issueUnitLabel}
        hint="可填 0 表示本行不发料；库存和仓位按基础单位实时校验"
      />

      <ChipSelectField
        label="实发单位"
        required
        options={unitOptions}
        value={item.issueUnit}
        onChange={handleIssueUnitChange}
        overflow="scroll"
      />
      {loadingUnitFactors ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>正在加载可发料单位…</Text>
      ) : unitFactorError ? (
        <Text style={[styles.warning, { color: colors.warning }]}>
          单位换算加载失败，仅可按基础单位发料：{unitFactorError}
        </Text>
      ) : item.issueUnit !== item.baseUnit && issueBaseQty === null ? (
        <Text style={[styles.error, { color: colors.error }]}>
          未维护“{issueUnitLabel}”到“{baseUnitLabel}”的换算关系
        </Text>
      ) : item.issueUnit !== item.baseUnit && issueBaseQty !== null ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          折合 {issueBaseQty}
          {baseUnitLabel ? ` ${baseUnitLabel}` : ''}
        </Text>
      ) : null}

      <WarehouseCandidateField
        label="实际出库仓"
        required={issueBaseQty !== null && issueBaseQty > 0}
        value={item.warehouseId}
        onChange={(warehouseId) =>
          onChange(index, {
            warehouseId,
            batchNo: '',
            location: null,
            storageLocation: '',
          })
        }
        candidates={candidates}
        loading={loadingStock}
        unit={baseUnitLabel}
        emptyText={stockError || '暂无有库存的出库仓'}
        error={stockError}
        helperText={
          selectedWarehouse
            ? selectedWarehouse.canFulfillQty
              ? '库存以确认提交时的实时校验为准'
              : '当前可用量不足，不能确认发料'
            : loadingStock
              ? '正在加载库存，请稍候'
              : stockError
                ? '库存查询失败，请检查库存查询权限或网络后重试'
                : '暂无有库存的出库仓'
        }
      />

      <ExistingBatchPickerField
        materialId={item.materialId}
        warehouseId={item.warehouseId || undefined}
        ownerType={ownerType}
        ownerRefId={ownerRefId}
        customerId={ownerType === InventoryOwnerType.CUSTOMER ? ownerRefId : undefined}
        value={item.batchNo}
        onChangeBatchNo={(batchNo) => onChange(index, { batchNo, location: null })}
        label={item.material?.hasBatchTracking ? '已有批号' : '已有批号（选填）'}
        placeholder={item.material?.hasBatchTracking ? '请选择出库批号' : '可选，按批号追溯'}
        disabled={!item.warehouseId || issueBaseQty === null || issueBaseQty <= 0}
        disabledReason={
          !item.warehouseId
            ? '请先选择实际出库仓'
            : issueBaseQty === null || issueBaseQty <= 0
              ? '请先填写有效的本次数量'
              : undefined
        }
      />

      {issueBaseQty !== null && issueBaseQty > 0 ? (
        <StockLocationField
          label="实际出库仓位"
          action="stock/out"
          warehouseId={item.warehouseId || undefined}
          materialId={item.materialId}
          batchNo={item.batchNo || undefined}
          minAvailableQty={issueBaseQty}
          value={item.location}
          onChange={handleLocationChange}
          storageLocation={item.storageLocation}
          onStorageLocationChange={handleStorageLocationChange}
          showStorageLocationText
          onRequirementChange={handleLocationRequirementChange}
        />
      ) : null}

      <FormField
        label="等级/来源例外原因"
        value={item.gradeExceptionReason}
        onChangeText={(gradeExceptionReason) => onChange(index, { gradeExceptionReason })}
        placeholder="策略要求例外放行时填写"
        multiline
        numberOfLines={2}
      />
      <FormField
        label="超发例外原因"
        value={item.overIssueReason}
        onChangeText={(overIssueReason) => onChange(index, { overIssueReason })}
        placeholder="实发超出待领量且策略要求时填写"
        multiline
        numberOfLines={2}
      />
    </View>
  );
}

export function createCompleteIssueItemDraft(item: MaterialIssueItem): CompleteIssueItemDraft {
  const material = item.material;
  const materialReq = item.materialReq;
  return {
    id: item.id,
    materialId: item.materialId,
    material,
    materialReq,
    materialCode: material?.code ?? materialReq?.material?.code ?? '未编码物料',
    materialName: material?.name ?? materialReq?.material?.name ?? '未命名物料',
    requiredQty: Number(item.requiredQty ?? 0),
    baseUnit: material?.unit ?? materialReq?.material?.unit ?? materialReq?.baseUnit ?? '',
    issueQty: String(item.requiredQty ?? 0),
    issueUnit: material?.unit ?? materialReq?.material?.unit ?? materialReq?.baseUnit ?? '',
    warehouseId: item.warehouseId ?? '',
    batchNo: item.batchNo ?? '',
    location: item.location
      ? {
          id: item.location.id,
          warehouseId: item.location.warehouseId,
          code: item.location.code,
          name: item.location.name,
          pathName: item.location.pathName || item.location.name,
        }
      : null,
    storageLocation: item.storageLocationSnapshot ?? '',
    gradeExceptionReason: '',
    overIssueReason: '',
    locationRequired: false,
  };
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: { fontSize: FontSize.sm, fontWeight: '600' },
  requiredQty: { fontSize: FontSize.xs },
  material: { fontSize: FontSize.sm, fontWeight: '500' },
  hint: { fontSize: FontSize.xs, lineHeight: 18 },
  warning: { fontSize: FontSize.xs, lineHeight: 18 },
  error: { fontSize: FontSize.xs, lineHeight: 18 },
});
