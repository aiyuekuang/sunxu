export type FinishedProductSerialShipmentDto = {
    batchNo?: string | null;
    customerName?: string | null;
    deliveryDate?: string | null;
    deliveryItemId?: string | null;
    deliveryNo?: string | null;
    quantity: number;
    remarks?: string | null;
    shipmentRecordedAt: string;
    status?: string | null;
};
