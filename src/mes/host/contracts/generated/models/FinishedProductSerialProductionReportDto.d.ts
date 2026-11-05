export type FinishedProductSerialProductionReportDto = {
    batchNo?: string | null;
    completedQty: number;
    equipmentName?: string | null;
    occurredAt?: string | null;
    operationName?: string | null;
    photoUrls?: Array<string>;
    remarks?: string | null;
    reportLogId: string;
    scrappedQty: number;
};
