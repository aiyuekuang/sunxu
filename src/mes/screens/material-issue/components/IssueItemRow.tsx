import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { InventoryOwnerType } from '../../../types/models/InventoryOwnerType';
import type { MaterialReq } from '../../../host/services';
import { compareWarehousesByDisplayOrder, type Stock } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ExistingBatchPickerField } from '../../../components/common/ExistingBatchPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { PickerField, type PickerOption } from '../../../../core/components/PickerField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { ISSUE_MODE_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import {
  WarehouseCandidateField,
  type WarehouseCandidateOption,
} from '../../warehouse/components/WarehouseCandidateField.tsx';
import {
  getIssueWarehouseFamiliesByMaterialType,
  resolveMaterialBaseType,
} from '../../../screen-support/work-orders/receipt-warehouse-policy';
import { getAvailableQty } from '../../../screen-support/warehouse/utils';
import { getWarehouseTypeFamily } from '../../../utils/warehouse-type';
import { buildMaterialIdentitySublabel } from '../../../utils/material-identity';
import { formatQtyWithUnit, formatUnitLabel } from '../../../utils/qty-unit';
import {
  getMaterialReqOwnerLabel,
  getMaterialReqOwnerRefId,
  getMaterialReqOwnerType,
  getMaterialReqStockKey,
} from '../utils/materialReqOwner';

export interface IssueItem {
  materialReqId: string;
  materialId: string;
  substituteMaterialId: string;
  substitutionReason: string;
  warehouseId: string;
  locationId: string;
  storageLocation: string;
  qty: string;
  issueUnit: string;
  issueQty: string;
  batchNo: string;
  gradeExceptionReason: string;
  overIssueReason: string;
  remarks: string;
}

export const EMPTY_ISSUE_ITEM: IssueItem = {
  materialReqId: '',
  materialId: '',
  substituteMaterialId: '',
  substitutionReason: '',
  warehouseId: '',
  locationId: '',
  storageLocation: '',
  qty: '',
  issueUnit: '',
  issueQty: '',
  batchNo: '',
  gradeExceptionReason: '',
  overIssueReason: '',
  remarks: '',
};

interface IssueItemRowProps {
  item: IssueItem;
  index: number;
  canDelete: boolean;
  materialReqError?: string;
  warehouseError?: string;
  quantityError?: string;
  substitutionReasonError?: string;
  materialReqOptions: PickerOption[];
  materialReqs: MaterialReq[];
  materialStocksByKey: Record<string, Stock[]>;
  loadingMaterialStocks: Record<string, boolean>;
  materialStockErrors: Record<string, string | undefined>;
  onChange: (index: number, item: IssueItem) => void;
  onDelete: (index: number) => void;
}

function getOutstandingQty(req: Pick<MaterialReq, 'requiredQty' | 'issuedQty' | 'returnedQty'>) {
  return Math.max(
    0,
    Number(req.requiredQty ?? 0) - Number(req.issuedQty ?? 0) + Number(req.returnedQty ?? 0),
  );
}

export const IssueItemRow = React.memo(function IssueItemRow({
  item,
  index,
  canDelete,
  materialReqError,
  warehouseError,
  quantityError,
  substitutionReasonError,
  materialReqOptions,
  materialReqs,
  materialStocksByKey,
  loadingMaterialStocks,
  materialStockErrors,
  onChange,
  onDelete,
}: IssueItemRowProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [warehouseTouched, setWarehouseTouched] = useState(false);

  const matchedReq = useMemo(
    () => materialReqs.find((req) => req.id === item.materialReqId) ?? null,
    [item.materialReqId, materialReqs],
  );
  const matchedSubstitute = useMemo(
    () =>
      matchedReq?.approvedSubstitutes?.find(
        (substitute) => substitute.substituteMaterialId === item.substituteMaterialId,
      ) ?? null,
    [item.substituteMaterialId, matchedReq],
  );
  const parsedQty = Number(item.qty);
  const hasValidQty = item.qty.trim() !== '' && !Number.isNaN(parsedQty) && parsedQty > 0;
  const outstandingQty = matchedReq ? getOutstandingQty(matchedReq) : 0;
  const issueModeLabel = matchedReq
    ? (ISSUE_MODE_CONFIG[matchedReq.issueMode ?? 'direct']?.label ?? '直接供料')
    : '';
  const actualMaterial = matchedSubstitute?.substituteMaterial ?? matchedReq?.material;
  const unit = actualMaterial?.unit ?? matchedReq?.material?.unit ?? '';
  const unitLabel = formatUnitLabel(unit, unitLabelMap);
  const sourceWarehouseName = matchedReq?.warehouse?.name ?? '-';
  const lineSideWarehouseName = matchedReq?.lineSideWarehouse?.name ?? '-';
  const ownerLabel = matchedReq ? getMaterialReqOwnerLabel(matchedReq) : '';
  const actualMaterialId = item.materialId || matchedReq?.materialId || '';
  const stockKey =
    matchedReq && actualMaterialId ? getMaterialReqStockKey(matchedReq, actualMaterialId) : '';
  const ownerType = matchedReq ? getMaterialReqOwnerType(matchedReq) : undefined;
  const ownerRefId = matchedReq ? getMaterialReqOwnerRefId(matchedReq) : undefined;

  const warehouseCandidates = useMemo<WarehouseCandidateOption[]>(() => {
    if (!matchedReq || !item.materialId) return [];

    const preferredWarehouseId =
      matchedReq.issueMode === 'staged'
        ? (matchedReq.lineSideWarehouseId ?? '')
        : (matchedReq.warehouseId ?? '');
    const allowedFamilies = getIssueWarehouseFamiliesByMaterialType(
      resolveMaterialBaseType(actualMaterial),
    );
    const allowedFamilyValues = new Set(allowedFamilies.map((family) => String(family)));

    return (materialStocksByKey[stockKey] ?? [])
      .map((stock) => {
        const warehouse = stock.warehouse;
        if (!warehouse) return null;
        const warehouseFamily = getWarehouseTypeFamily(warehouse.type);
        const isCompatibleDirectWarehouse =
          stock.warehouseId === matchedReq.warehouseId ||
          (warehouseFamily !== '' && allowedFamilyValues.has(warehouseFamily));
        if (matchedReq.issueMode === 'staged') {
          if (stock.warehouseId !== matchedReq.lineSideWarehouseId) {
            return null;
          }
        } else if (!isCompatibleDirectWarehouse) {
          return null;
        }

        const availableQty = getAvailableQty(stock);
        if (availableQty <= 0) return null;

        return {
          warehouse,
          availableQty,
          canFulfillQty: hasValidQty ? availableQty >= parsedQty : true,
          isPreferred: preferredWarehouseId !== '' && warehouse.id === preferredWarehouseId,
        };
      })
      .filter(
        (
          candidate,
        ): candidate is WarehouseCandidateOption & {
          isPreferred: boolean;
        } => candidate !== null,
      )
      .sort((left, right) => {
        if (Number(right.canFulfillQty) !== Number(left.canFulfillQty)) {
          return Number(right.canFulfillQty) - Number(left.canFulfillQty);
        }
        if (Number(right.isPreferred) !== Number(left.isPreferred)) {
          return Number(right.isPreferred) - Number(left.isPreferred);
        }
        const displayOrder = compareWarehousesByDisplayOrder(left.warehouse, right.warehouse);
        if (displayOrder !== 0) return displayOrder;
        if (right.availableQty !== left.availableQty) {
          return right.availableQty - left.availableQty;
        }
        return 0;
      })
      .map(({ warehouse, availableQty, canFulfillQty }) => ({
        warehouse,
        availableQty,
        canFulfillQty,
      }));
  }, [
    actualMaterial,
    hasValidQty,
    item.materialId,
    materialStocksByKey,
    matchedReq,
    parsedQty,
    stockKey,
  ]);

  const actualMaterialOptions = useMemo(() => {
    if (!matchedReq) return [];
    const options: PickerOption[] = [
      {
        value: '',
        label: `原需求物料 · ${
          matchedReq.material
            ? buildMaterialIdentitySublabel(matchedReq.material, unitLabelMap)
            : matchedReq.materialId
        }`,
      },
    ];
    for (const substitute of matchedReq.approvedSubstitutes ?? []) {
      options.push({
        value: substitute.substituteMaterialId,
        label: `替代料 · ${
          substitute.substituteMaterial
            ? buildMaterialIdentitySublabel(substitute.substituteMaterial, unitLabelMap)
            : substitute.substituteMaterialId
        }`,
      });
    }
    return options;
  }, [matchedReq, unitLabelMap]);

  const locationOptions = useMemo(() => {
    if (!item.warehouseId || !stockKey) return [];
    const seen = new Set<string>();
    return (materialStocksByKey[stockKey] ?? [])
      .filter((stock) => stock.warehouseId === item.warehouseId && stock.locationId)
      .flatMap((stock) => {
        const locationId = stock.locationId;
        if (!locationId || seen.has(locationId)) return [];
        seen.add(locationId);
        return [
          {
            value: locationId,
            label: stock.location?.pathName || stock.location?.name || locationId,
          },
        ];
      });
  }, [item.warehouseId, materialStocksByKey, stockKey]);

  useEffect(() => {
    if (!matchedReq) {
      if (
        item.materialId ||
        item.warehouseId ||
        item.batchNo ||
        item.substituteMaterialId ||
        item.locationId ||
        item.storageLocation
      ) {
        onChange(index, {
          ...item,
          materialId: '',
          substituteMaterialId: '',
          substitutionReason: '',
          warehouseId: '',
          locationId: '',
          storageLocation: '',
          batchNo: '',
        });
      }
      return;
    }

    const expectedMaterialId = item.substituteMaterialId || matchedReq.materialId;
    if (item.materialId !== expectedMaterialId) {
      onChange(index, {
        ...item,
        materialId: expectedMaterialId,
        warehouseId: '',
        locationId: '',
        batchNo: '',
      });
      return;
    }

    if (warehouseCandidates.length === 0) {
      if (item.warehouseId) {
        onChange(index, { ...item, warehouseId: '', locationId: '', batchNo: '' });
      }
      return;
    }

    const currentCandidate = warehouseCandidates.find(
      (candidate) => candidate.warehouse.id === item.warehouseId,
    );
    if (!currentCandidate) {
      onChange(index, {
        ...item,
        warehouseId: warehouseCandidates[0].warehouse.id,
        locationId: '',
        batchNo: '',
      });
      setWarehouseTouched(false);
      return;
    }

    if (!warehouseTouched && warehouseCandidates[0].warehouse.id !== item.warehouseId) {
      onChange(index, {
        ...item,
        warehouseId: warehouseCandidates[0].warehouse.id,
        locationId: '',
        batchNo: '',
      });
    }
  }, [
    index,
    item,
    item.batchNo,
    item.locationId,
    item.materialId,
    item.storageLocation,
    item.substituteMaterialId,
    item.warehouseId,
    matchedReq,
    onChange,
    warehouseCandidates,
    warehouseTouched,
  ]);

  const handleMaterialReqChange = useCallback(
    (materialReqId: string) => {
      const nextReq = materialReqs.find((req) => req.id === materialReqId) ?? null;
      setWarehouseTouched(false);
      onChange(index, {
        ...item,
        materialReqId,
        materialId: nextReq?.materialId ?? '',
        substituteMaterialId: '',
        substitutionReason: '',
        warehouseId: '',
        locationId: '',
        storageLocation: '',
        batchNo: '',
      });
    },
    [index, item, materialReqs, onChange],
  );

  const handleWarehouseChange = useCallback(
    (warehouseId: string) => {
      setWarehouseTouched(true);
      onChange(index, {
        ...item,
        warehouseId,
        locationId: '',
        batchNo: '',
      });
    },
    [index, item, onChange],
  );

  const handleQtyChange = useCallback(
    (qty: string) => {
      onChange(index, { ...item, qty });
    },
    [index, item, onChange],
  );

  const handleBatchNoChange = useCallback(
    (batchNo: string) => {
      onChange(index, { ...item, batchNo });
    },
    [index, item, onChange],
  );

  const handleRemarksChange = useCallback(
    (remarks: string) => {
      onChange(index, { ...item, remarks });
    },
    [index, item, onChange],
  );

  const handleActualMaterialChange = useCallback(
    (substituteMaterialId: string) => {
      if (!matchedReq) return;
      onChange(index, {
        ...item,
        substituteMaterialId,
        substitutionReason: substituteMaterialId ? item.substitutionReason : '',
        materialId: substituteMaterialId || matchedReq.materialId,
        warehouseId: '',
        locationId: '',
        batchNo: '',
      });
      setWarehouseTouched(false);
    },
    [index, item, matchedReq, onChange],
  );

  const handleLocationChange = useCallback(
    (locationId: string) => {
      onChange(index, { ...item, locationId, batchNo: '' });
    },
    [index, item, onChange],
  );

  const handleStorageLocationChange = useCallback(
    (storageLocation: string) => {
      onChange(index, { ...item, storageLocation });
    },
    [index, item, onChange],
  );

  const handleIssueUnitChange = useCallback(
    (issueUnit: string) => {
      onChange(index, { ...item, issueUnit });
    },
    [index, item, onChange],
  );

  const handleIssueQtyChange = useCallback(
    (issueQty: string) => {
      onChange(index, { ...item, issueQty });
    },
    [index, item, onChange],
  );

  const handleSubstitutionReasonChange = useCallback(
    (substitutionReason: string) => {
      onChange(index, { ...item, substitutionReason });
    },
    [index, item, onChange],
  );

  const handleGradeExceptionReasonChange = useCallback(
    (gradeExceptionReason: string) => {
      onChange(index, { ...item, gradeExceptionReason });
    },
    [index, item, onChange],
  );

  const handleOverIssueReasonChange = useCallback(
    (overIssueReason: string) => {
      onChange(index, { ...item, overIssueReason });
    },
    [index, item, onChange],
  );

  const stockError = stockKey ? materialStockErrors[stockKey] : undefined;

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.textSecondary }]}>明细 #{index + 1}</Text>
        {canDelete && (
          <Pressable onPress={() => onDelete(index)} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={colors.error} />
          </Pressable>
        )}
      </View>

      <PickerField
        label="工单需求行"
        required
        value={item.materialReqId}
        onChange={handleMaterialReqChange}
        options={materialReqOptions}
        placeholder="先选择要领的需求行"
        error={materialReqError}
      />

      {matchedReq ? (
        <View style={[styles.reqCard, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.reqTitle, { color: colors.text }]}>
            {matchedReq.material?.code ?? '未编码'} · {matchedReq.material?.name ?? '未命名物料'}
          </Text>
          {matchedReq.material ? (
            <Text style={[styles.reqMeta, { color: colors.textSecondary }]}>
              {buildMaterialIdentitySublabel(matchedReq.material, unitLabelMap)}
            </Text>
          ) : null}
          <Text style={[styles.reqMeta, { color: colors.textSecondary }]}>
            供料策略：{issueModeLabel}
          </Text>
          <Text style={[styles.reqMeta, { color: colors.textSecondary }]}>
            库存货主：{ownerLabel}
          </Text>
          <Text style={[styles.reqMeta, { color: colors.textSecondary }]}>
            来源仓：{sourceWarehouseName}
          </Text>
          <Text style={[styles.reqMeta, { color: colors.textSecondary }]}>
            线边仓：{lineSideWarehouseName}
          </Text>
          <Text style={[styles.reqMeta, { color: colors.textSecondary }]}>
            当前待领：{formatQtyWithUnit(outstandingQty, unit, unitLabelMap, { fallback: '0' })}
          </Text>
          {(matchedReq.approvedSubstitutes?.length ?? 0) > 0 ? (
            <Text style={[styles.reqMeta, { color: colors.warning }]}>
              已批准替代料：{matchedReq.approvedSubstitutes?.length ?? 0} 个
            </Text>
          ) : null}
        </View>
      ) : null}

      {matchedReq && actualMaterialOptions.length > 1 ? (
        <PickerField
          label="实际领料物料"
          value={item.substituteMaterialId}
          onChange={handleActualMaterialChange}
          options={actualMaterialOptions}
          placeholder="默认使用原需求物料"
        />
      ) : null}

      {item.substituteMaterialId ? (
        <FormField
          label="替代原因"
          required
          value={item.substitutionReason}
          onChangeText={handleSubstitutionReasonChange}
          placeholder="说明使用替代料的业务原因"
          error={substitutionReasonError}
          multiline
          numberOfLines={2}
        />
      ) : null}

      <WarehouseCandidateField
        label="实际出库仓"
        required
        value={item.warehouseId}
        onChange={handleWarehouseChange}
        candidates={warehouseCandidates}
        loading={stockKey ? (loadingMaterialStocks[stockKey] ?? false) : false}
        disabled={!matchedReq}
        unit={unitLabel}
        helperText={
          matchedReq
            ? matchedReq.issueMode === 'staged'
              ? '线边供料只能从线边仓领料'
              : '直接供料按实际可用仓选择出库仓'
            : undefined
        }
        emptyText={matchedReq ? '暂无可用仓库' : '请先选择工单需求行'}
        error={warehouseError ?? stockError}
      />

      <QuickNumInput
        label="领料数量"
        required
        value={item.qty}
        onChangeText={handleQtyChange}
        placeholder="请输入领料数量"
        error={quantityError}
      />

      <FormField
        label="显示单位"
        value={item.issueUnit}
        onChangeText={handleIssueUnitChange}
        placeholder={unitLabel ? `默认 ${unitLabel}` : '默认基础单位'}
      />

      <QuickNumInput
        label="显示数量"
        value={item.issueQty}
        onChangeText={handleIssueQtyChange}
        placeholder="不填则同领料数量"
        min={0}
        clampToBounds={false}
      />

      {locationOptions.length > 0 ? (
        <PickerField
          label="实际出库仓位"
          value={item.locationId}
          onChange={handleLocationChange}
          options={locationOptions}
          placeholder="按库存仓位选择，可选"
          clearable
        />
      ) : null}

      <FormField
        label="存放位置"
        value={item.storageLocation}
        onChangeText={handleStorageLocationChange}
        placeholder="未启用仓位管控时可填写文本位置"
      />

      <ExistingBatchPickerField
        materialId={item.materialId || undefined}
        warehouseId={item.warehouseId || undefined}
        ownerType={ownerType}
        ownerRefId={ownerRefId}
        customerId={ownerType === InventoryOwnerType.CUSTOMER ? ownerRefId : undefined}
        value={item.batchNo}
        onChangeBatchNo={handleBatchNoChange}
        disabled={!item.materialId || !item.warehouseId}
      />

      <FormField
        label="等级/来源例外原因"
        value={item.gradeExceptionReason}
        onChangeText={handleGradeExceptionReasonChange}
        placeholder="策略提示需要例外放行时填写"
        multiline
        numberOfLines={2}
      />

      <FormField
        label="超发例外原因"
        value={item.overIssueReason}
        onChangeText={handleOverIssueReasonChange}
        placeholder="实发超出剩余可领量且策略要求时填写"
        multiline
        numberOfLines={2}
      />

      <FormField
        label="行备注"
        value={item.remarks}
        onChangeText={handleRemarksChange}
        placeholder="选填"
        multiline
        numberOfLines={2}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  reqCard: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  reqTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  reqMeta: {
    fontSize: FontSize.xs,
  },
});
