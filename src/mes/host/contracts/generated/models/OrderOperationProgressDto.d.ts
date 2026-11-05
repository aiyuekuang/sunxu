export type OrderOperationProgressDto = {
    completedQty: number;
    effectiveQty: number;
    name: string;
    progress: number;
    reportedQty: number;
    scrappedQty: number;
    sequence: number;
    status: string;
};
