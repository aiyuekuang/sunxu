export type TraceNodeDto = {
    batchId: string;
    batchNo: string;
    children: Array<TraceNodeDto>;
    materialId: string;
    materialName?: string;
    materialUnit?: string;
    qty: number;
    workOrderId?: string;
    workOrderNo?: string;
};
