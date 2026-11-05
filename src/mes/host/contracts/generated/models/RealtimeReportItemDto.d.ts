export type RealtimeReportItemDto = {
    materialName?: string;
    operationName?: string | null;
    orderNo: string;
    qty: number;
    scrappedQty: number;
    time: string;
    worker?: string | null;
};
