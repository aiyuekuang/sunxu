import type { WorkOrderExecutionState } from './WorkOrderExecutionState.d.ts';
export type ScanWorkOrderInfoDto = {
    completedQty: number;
    executionState?: WorkOrderExecutionState | null;
    id: string;
    materialName?: string | null;
    materialUnit?: string | null;
    orderNo: string;
    plannedQty: number;
    progress: number;
    reportedQty: number;
    scrappedQty: number;
    status: string;
};
