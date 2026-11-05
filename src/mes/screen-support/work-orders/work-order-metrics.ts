import type { WorkOrderDetail, WorkOrderOperation } from '../../host/services';

function getOperationReportedQty(operation: WorkOrderOperation): number {
  return Number(operation.completedQty ?? 0) + Number(operation.scrappedQty ?? 0);
}

function getActiveOperations(operations: WorkOrderOperation[]): WorkOrderOperation[] {
  return operations.filter((operation) => operation.status !== 'skipped');
}

export function getDisplayCompletedQty(
  order: Pick<WorkOrderDetail, 'completedQty' | 'bottleneckCompletedQty'>,
): number {
  return Number(order.bottleneckCompletedQty ?? order.completedQty ?? 0);
}

export function getDisplayScrappedQty(
  order: Pick<WorkOrderDetail, 'scrappedQty' | 'operations'>,
): number {
  const operations = order.operations ?? [];
  if (operations.length === 0) {
    return Number(order.scrappedQty ?? 0);
  }

  return getActiveOperations(operations).reduce(
    (sum, operation) => sum + Number(operation.scrappedQty ?? 0),
    0,
  );
}

export function getSplitMetrics(
  order: Pick<WorkOrderDetail, 'plannedQty' | 'completedQty' | 'scrappedQty' | 'operations'>,
): {
  remainQty: number;
  allowFullSplit: boolean;
  maxReportedQty: number;
} {
  const operations = order.operations ?? [];
  const maxReportedQty =
    operations.length > 0
      ? getActiveOperations(operations).reduce(
          (maxQty, operation) => Math.max(maxQty, getOperationReportedQty(operation)),
          0,
        )
      : Number(order.completedQty ?? 0) + Number(order.scrappedQty ?? 0);

  return {
    remainQty: Math.max(0, Number(order.plannedQty ?? 0) - maxReportedQty),
    allowFullSplit: maxReportedQty > 0,
    maxReportedQty,
  };
}
