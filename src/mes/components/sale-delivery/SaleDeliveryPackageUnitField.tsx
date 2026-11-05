import { useCallback } from 'react';
import { packageUnitService } from '../../host/services';
import type { PackageUnitLine } from '../../types/models/PackageUnitLine';
import { EntityPickerField } from '../../../core/components/EntityPickerField.tsx';
import { P } from '../../host/authorization';
import { PACKAGE_TYPE_LABELS, PACKAGE_UNIT_STATUS_CONFIG } from '../../constants/status-configs';
import { usePermission } from '../../host/hooks/usePermission';
import { formatNumber } from '../../../core/utils/format';
import { toast } from '../../../core/toast';

/** 表单只依赖展示和回填所需字段，避免为了回显构造完整 PackageUnit。 */
export interface SaleDeliveryPackageUnitOption {
  id: string;
  packageNo: string;
  batchNo?: string | null;
  totalQty?: number;
  packageType?: string;
  status?: string;
  lines?: PackageUnitLine[];
}

interface SaleDeliveryPackageUnitFieldProps {
  warehouseId?: string | null;
  materialId?: string | null;
  batchNo?: string | null;
  deliveryOrderId?: string;
  value?: SaleDeliveryPackageUnitOption | null;
  onChange: (item: SaleDeliveryPackageUnitOption | null) => void;
  required?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  error?: string;
}

function buildPackageSublabel(unit: SaleDeliveryPackageUnitOption): string {
  const statusLabel = unit.status
    ? (PACKAGE_UNIT_STATUS_CONFIG[unit.status]?.label ?? unit.status)
    : '';
  const typeLabel = unit.packageType
    ? (PACKAGE_TYPE_LABELS[unit.packageType] ?? unit.packageType)
    : '';
  return [
    unit.batchNo ? `批号 ${unit.batchNo}` : '未启用批号',
    `数量 ${formatNumber(unit.totalQty, { fallback: '0', maximumFractionDigits: 4 })}`,
    typeLabel,
    statusLabel,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function SaleDeliveryPackageUnitField({
  warehouseId,
  materialId,
  batchNo,
  deliveryOrderId,
  value,
  onChange,
  required = false,
  disabled = false,
  disabledReason,
  error,
}: SaleDeliveryPackageUnitFieldProps) {
  const canViewPackage = usePermission(P.WAREHOUSE_PACKAGE_VIEW);
  const prerequisitesReady = Boolean(warehouseId && materialId);

  const fetchPackages = useCallback(
    async ({ page, pageSize, keyword }: { page: number; pageSize: number; keyword?: string }) => {
      if (!warehouseId || !materialId) {
        return { list: [], total: 0 };
      }
      const result = await packageUnitService.availableForDelivery({
        page,
        pageSize,
        keyword,
        warehouseId,
        materialId,
        batchNo: batchNo?.trim() || undefined,
        deliveryOrderId,
      });
      return { list: result.list, total: result.total };
    },
    [batchNo, deliveryOrderId, materialId, warehouseId],
  );

  const handleScan = useCallback(
    async (code: string) => {
      const packageNo = code.trim();
      if (!packageNo) return;
      if (!warehouseId || !materialId) {
        toast.info('请先选择物料和出库仓');
        return;
      }
      try {
        const result = await packageUnitService.availableForDelivery({
          page: 1,
          pageSize: 20,
          keyword: packageNo,
          warehouseId,
          materialId,
          batchNo: batchNo?.trim() || undefined,
          deliveryOrderId,
        });
        const matches = result.list.filter((unit) => unit.packageNo === packageNo);
        if (matches.length !== 1) {
          toast.info(
            matches.length === 0
              ? '当前物料和仓库范围内未找到可选包装箱'
              : '包装箱匹配多条记录，请从列表中选择',
          );
          return;
        }
        onChange(matches[0]);
        toast.success(`已选择包装箱 ${matches[0].packageNo}`);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : '包装箱查询失败');
      }
    },
    [batchNo, deliveryOrderId, materialId, onChange, warehouseId],
  );

  const resolvedDisabledReason = !prerequisitesReady
    ? '请先选择物料和出库仓'
    : disabled
      ? (disabledReason ?? '当前字段不可修改')
      : undefined;

  const handleChange = useCallback(
    (next: SaleDeliveryPackageUnitOption | null) => {
      // 打开选择器后直接确认时，回传的是只带 id/包号的原值，不是完整包装单元，不能当成新选择。
      if (next && !next.lines && next.id === value?.id) return;
      onChange(next);
    },
    [onChange, value?.id],
  );

  if (!canViewPackage) return null;

  return (
    <EntityPickerField<SaleDeliveryPackageUnitOption>
      label="包装箱"
      required={required}
      value={value ?? null}
      onChange={handleChange}
      fetchFn={fetchPackages}
      keyExtractor={(unit) => unit.id}
      labelExtractor={(unit) => unit.packageNo}
      sublabelExtractor={buildPackageSublabel}
      title="选择包装箱"
      placeholder={prerequisitesReady ? '选择可用于发货的包装箱' : '请先选择物料和出库仓'}
      disabled={!prerequisitesReady || disabled}
      disabledReason={resolvedDisabledReason}
      error={error}
      clearable
      scannable
      onScanResult={handleScan}
    />
  );
}
