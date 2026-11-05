export type FinishedProductSerialProductionReceiptDto = {
    confirmedAt?: string | null;
    plannedReceiptQty: number;
    receiptNo: string;
    receiptOrderId: string;
    remarks?: string | null;
    status: string;
};
