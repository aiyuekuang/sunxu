import type { ProductionPlanNetDemandPreviewResponseDto } from '../host/api-types';
import { ProductionPlanSourceDemandType } from '../host/api-types';
import { ProductionPlanStockNettingMode } from '../host/api-types';
import type { SaleOrderConvertInfoItemDto } from '../host/api-types';

const EPSILON = 0.0001;

export interface StockNettingPayload {
  sourceDemandQty?: number;
  stockOffsetQty?: number;
  stockNettingMode: ProductionPlanStockNettingMode | string;
  stockNettingSnapshot?: Record<string, unknown>;
  stockNettingReason?: string;
  sourceDemandType?: ProductionPlanSourceDemandType | string;
}

export function nearlyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) <= EPSILON;
}

export function buildStockNettingSnapshotFromConvertRow(
  row: SaleOrderConvertInfoItemDto,
): Record<string, unknown> {
  return {
    materialId: row.materialId,
    materialName: row.materialName,
    materialCode: row.materialCode,
    grossDemandQty: row.grossDemandQty,
    currentStockQty: row.currentStockQty,
    safetyStockQty: row.safetyStockQty,
    stockOffsetQty: row.stockOffsetQty,
    suggestedProductionQty: row.suggestedProductionQty,
    source: row.source,
  };
}

export function resolveSalesOrderStockNettingPayload(
  row: SaleOrderConvertInfoItemDto,
  requiredQty: number,
  stockNettingReason?: string,
): StockNettingPayload {
  const sourceDemandQty = Number(row.remainingRequiredQty ?? 0);
  const stockOffsetQty = Math.max(sourceDemandQty - requiredQty, 0);
  if (!(stockOffsetQty > 0)) {
    return { stockNettingMode: ProductionPlanStockNettingMode.NONE };
  }

  const suggestedProductionQty = Number(row.suggestedProductionQty ?? 0);
  const stockNettingMode = nearlyEqual(requiredQty, suggestedProductionQty)
    ? ProductionPlanStockNettingMode.ACCEPTED
    : ProductionPlanStockNettingMode.MANUAL_OVERRIDE;

  return {
    sourceDemandQty,
    stockOffsetQty,
    stockNettingMode,
    stockNettingSnapshot: buildStockNettingSnapshotFromConvertRow(row),
    stockNettingReason:
      stockNettingMode === ProductionPlanStockNettingMode.MANUAL_OVERRIDE
        ? stockNettingReason?.trim()
        : undefined,
    sourceDemandType: ProductionPlanSourceDemandType.SALES_ORDER,
  };
}

export function isManualSalesOrderStockNetting(
  row: SaleOrderConvertInfoItemDto,
  requiredQty: number,
): boolean {
  if (!(requiredQty > 0)) return false;
  const sourceDemandQty = Number(row.remainingRequiredQty ?? 0);
  const stockOffsetQty = Math.max(sourceDemandQty - requiredQty, 0);
  return stockOffsetQty > 0 && !nearlyEqual(requiredQty, Number(row.suggestedProductionQty ?? 0));
}

export function buildStockNettingSnapshotFromPreview(
  preview: ProductionPlanNetDemandPreviewResponseDto,
): Record<string, unknown> {
  return {
    materialId: preview.materialId,
    materialName: preview.materialName,
    materialCode: preview.materialCode,
    grossDemandQty: preview.grossDemandQty,
    currentStockQty: preview.currentStockQty,
    safetyStockQty: preview.safetyStockQty,
    stockOffsetQty: preview.stockOffsetQty,
    suggestedProductionQty: preview.suggestedProductionQty,
    stockScope: preview.stockScope,
    sourceDemandType: preview.sourceDemandType,
    lines: preview.lines,
    warnings: preview.warnings,
  };
}

export function resolveDirectPlanStockNettingPayload(
  preview: ProductionPlanNetDemandPreviewResponseDto | null,
  requiredQty: number,
  stockNettingReason?: string,
  sourceDemandType:
    | ProductionPlanSourceDemandType
    | string = ProductionPlanSourceDemandType.DIRECT_PLAN,
): StockNettingPayload {
  if (!preview || !(preview.stockOffsetQty > 0) || requiredQty >= preview.grossDemandQty) {
    return { stockNettingMode: ProductionPlanStockNettingMode.NONE };
  }

  const stockNettingMode = nearlyEqual(requiredQty, preview.suggestedProductionQty)
    ? ProductionPlanStockNettingMode.ACCEPTED
    : ProductionPlanStockNettingMode.MANUAL_OVERRIDE;

  return {
    sourceDemandQty: preview.grossDemandQty,
    stockOffsetQty: Math.max(preview.grossDemandQty - requiredQty, 0),
    stockNettingMode,
    stockNettingSnapshot: buildStockNettingSnapshotFromPreview(preview),
    stockNettingReason:
      stockNettingMode === ProductionPlanStockNettingMode.MANUAL_OVERRIDE
        ? stockNettingReason?.trim()
        : undefined,
    sourceDemandType,
  };
}

export function isManualDirectPlanStockNetting(
  preview: ProductionPlanNetDemandPreviewResponseDto | null,
  requiredQty: number | null,
): boolean {
  if (!preview || requiredQty === null || !(requiredQty > 0)) return false;
  const stockOffsetQty = Math.max(preview.grossDemandQty - requiredQty, 0);
  return stockOffsetQty > 0 && !nearlyEqual(requiredQty, preview.suggestedProductionQty);
}
