export type FinishedProductSerialSourceDemandDto = {
    customerSnapshot?: Record<string, any> | null;
    demandLineNo: number;
    saleOrderItemLineNo?: number | null;
    sourceOrderNo?: string | null;
    sourceType: string;
};
