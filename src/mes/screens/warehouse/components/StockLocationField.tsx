import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  type StockLocationPrecheckResponseDto,
  WarehouseLocationControlMode,
  warehouseService,
} from '../../../host/services';
import type {
  WarehouseLocation,
  WarehouseLocationTreeNodeDto,
} from '../../../host/services';
import { warehouseLocationService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import type { TreePickerNode } from '../../../../core/components/DrillDownTreePicker.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { TreePickerField } from '../../../../core/components/TreePickerField.tsx';
import { OPERATION_FEATURE as F, hasVisibleFeature } from '../../../host/authorization';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useAuthStore } from '../../../host/state/auth.store';
import { formatNumber } from '../../../../core/utils/format';
import { toast } from '../../../../core/toast';

export interface SelectedStockLocation {
  id: string;
  warehouseId: string;
  code: string;
  name: string;
  pathName: string;
}

interface StockLocationFieldProps {
  label: string;
  action: string;
  warehouseId?: string | null;
  value: SelectedStockLocation | null;
  onChange: (location: SelectedStockLocation | null) => void;
  storageLocation?: string;
  onStorageLocationChange?: (value: string) => void;
  showStorageLocationText?: boolean;
  materialId?: string | null;
  batchNo?: string | null;
  minAvailableQty?: number;
  onRequirementChange?: (required: boolean) => void;
}

function isRequiredLocationBlocker(message: string): boolean {
  return message.includes('必须选择仓位');
}

function toSelectedLocation(location: WarehouseLocation): SelectedStockLocation {
  return {
    id: location.id,
    warehouseId: location.warehouseId,
    code: location.code,
    name: location.name,
    pathName: location.pathName || location.name,
  };
}

function mapTreeNodes(
  nodes: readonly WarehouseLocationTreeNodeDto[],
  locationMap: Map<string, SelectedStockLocation>,
): TreePickerNode[] {
  return nodes.map((node) => {
    const selectedLocation: SelectedStockLocation = {
      id: node.id,
      warehouseId: node.warehouseId,
      code: node.code,
      name: node.name,
      pathName: node.pathName || node.name,
    };
    locationMap.set(node.id, selectedLocation);
    return {
      id: node.id,
      name: node.pathName || node.name,
      code: node.code,
      children: mapTreeNodes(node.children ?? [], locationMap),
    };
  });
}

export function StockLocationField({
  label,
  action,
  warehouseId,
  value,
  onChange,
  storageLocation,
  onStorageLocationChange,
  showStorageLocationText,
  materialId,
  batchNo,
  minAvailableQty,
  onRequirementChange,
}: StockLocationFieldProps) {
  const { colors } = useTheme();
  const operationConfig = useAuthStore((state) => state.operationConfig);
  const locationFeatureEnabled = hasVisibleFeature(operationConfig, F.INVENTORY_LOCATION_CONTROL);
  const locationMapRef = useRef(new Map<string, SelectedStockLocation>());
  const previousWarehouseIdRef = useRef<string | null | undefined>(undefined);
  const [precheck, setPrecheck] = useState<StockLocationPrecheckResponseDto | null>(null);
  const [loadingPrecheck, setLoadingPrecheck] = useState(false);

  useEffect(() => {
    if (!locationFeatureEnabled) {
      onChange(null);
      setPrecheck(null);
      setLoadingPrecheck(false);
      onRequirementChange?.(false);
      previousWarehouseIdRef.current = warehouseId;
      return;
    }

    if (previousWarehouseIdRef.current !== warehouseId) {
      const hasPreviousWarehouse = previousWarehouseIdRef.current !== undefined;
      if (hasPreviousWarehouse) {
        onChange(null);
        onStorageLocationChange?.('');
      }
      previousWarehouseIdRef.current = warehouseId;
    }

    if (!warehouseId) {
      setPrecheck(null);
      onRequirementChange?.(false);
      return;
    }

    let cancelled = false;
    setLoadingPrecheck(true);
    void warehouseService
      .stockLocationPrecheck({ action, warehouseId })
      .then((result) => {
        if (cancelled) return;
        setPrecheck(result);
        onRequirementChange?.(result.locationRequired);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setPrecheck(null);
        onRequirementChange?.(false);
        toast.error(error instanceof Error ? error.message : '仓位策略读取失败');
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingPrecheck(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    action,
    locationFeatureEnabled,
    onChange,
    onRequirementChange,
    onStorageLocationChange,
    warehouseId,
  ]);

  const displayBlockers = useMemo(
    () => (precheck?.blockers ?? []).filter((item) => !isRequiredLocationBlocker(item)),
    [precheck],
  );

  const fetchLocationTree = useCallback(async () => {
    if (!warehouseId) return [];
    if (materialId || batchNo || minAvailableQty !== undefined) {
      const distribution = await warehouseService.stockLocationDistribution({
        warehouseId,
        materialId: materialId ?? undefined,
        batchNo: batchNo ?? undefined,
        minAvailableQty,
      });
      const nextMap = new Map<string, SelectedStockLocation>();
      const nodes = distribution.locations
        .filter((item): item is typeof item & { locationId: string } => Boolean(item.locationId))
        .map((item) => {
          const id = item.locationId;
          const name = item.locationPath || item.locationName || item.locationCode || '未命名仓位';
          nextMap.set(id, {
            id,
            warehouseId,
            code: item.locationCode ?? '',
            name: item.locationName ?? name,
            pathName: name,
          });
          return {
            id,
            name: `${name}（可用 ${formatNumber(item.availableQty, {
              fallback: '0',
              maximumFractionDigits: 4,
            })}）`,
            code: item.locationCode ?? undefined,
            children: [],
          };
        });
      locationMapRef.current = nextMap;
      return nodes;
    }
    const tree = await warehouseLocationService.tree({
      warehouseId,
      activeOnly: true,
      stockOnly: true,
    });
    const nextMap = new Map<string, SelectedStockLocation>();
    const nodes = mapTreeNodes(tree, nextMap);
    locationMapRef.current = nextMap;
    return nodes;
  }, [batchNo, materialId, minAvailableQty, warehouseId]);

  const clearStorageLocationText = useCallback(() => {
    onStorageLocationChange?.('');
  }, [onStorageLocationChange]);

  const handleSelect = useCallback(
    (id: string, name: string) => {
      clearStorageLocationText();
      onChange(
        locationMapRef.current.get(id) ?? {
          id,
          warehouseId: warehouseId ?? '',
          code: '',
          name,
          pathName: name,
        },
      );
    },
    [clearStorageLocationText, onChange, warehouseId],
  );

  const handleScan = useCallback(
    async (code: string) => {
      if (!warehouseId) {
        toast.info('请先选择仓库');
        return;
      }
      const location = await warehouseLocationService.scan({ code });
      if (location.warehouseId !== warehouseId) {
        toast.error('扫码仓位不属于当前仓库');
        return;
      }
      if (!location.isActive || !location.allowStock) {
        toast.error('该仓位未启用或不允许作为库存落点');
        return;
      }
      clearStorageLocationText();
      onChange(toSelectedLocation(location));
      toast.success(`已选择仓位：${location.pathName || location.name}`);
    },
    [clearStorageLocationText, onChange, warehouseId],
  );

  const textField =
    showStorageLocationText && warehouseId ? (
      <FormField
        label="位置说明（可选）"
        value={storageLocation ?? ''}
        onChangeText={onStorageLocationChange ?? (() => {})}
        placeholder="未选择仓位时，填写货架、区域、托盘等位置"
        containerStyle={styles.textField}
      />
    ) : null;

  if (!warehouseId) {
    return null;
  }

  if (!locationFeatureEnabled) {
    return textField;
  }

  if (loadingPrecheck || !precheck) {
    return null;
  }

  if (precheck.locationControlMode === WarehouseLocationControlMode.NONE) {
    return textField;
  }

  const required = precheck.locationRequired;

  return (
    <View style={styles.container}>
      {displayBlockers.length > 0 ? (
        <View style={[styles.notice, { backgroundColor: colors.errorSurface }]}>
          <Text style={[styles.noticeText, { color: colors.error }]}>
            {displayBlockers.join('；')}
          </Text>
        </View>
      ) : null}
      {precheck.warnings.length > 0 ? (
        <View style={[styles.notice, { backgroundColor: colors.warningSurface }]}>
          <Text style={[styles.noticeText, { color: colors.warning }]}>
            {precheck.warnings.join('；')}
          </Text>
        </View>
      ) : null}
      <TreePickerField
        label={label}
        required={required}
        value={value?.id}
        displayValue={value?.pathName}
        fetchFn={fetchLocationTree}
        onSelect={handleSelect}
        onClear={() => {
          clearStorageLocationText();
          onChange(null);
        }}
        placeholder={required ? '当前仓库要求选择仓位' : '可选，选择后按仓位记录'}
        title={`选择${label}`}
        error={required && !value ? '请选择仓位' : undefined}
        scannable
        onScanResult={handleScan}
        renderExtra={(item) =>
          typeof item.code === 'string' && item.code ? (
            <Text style={[styles.extraText, { color: colors.textTertiary }]}>{item.code}</Text>
          ) : null
        }
      />
      {!required && !value ? textField : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  notice: {
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  noticeText: {
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  extraText: {
    fontSize: FontSize.xs,
  },
  textField: {
    marginTop: Spacing.xs,
  },
});
