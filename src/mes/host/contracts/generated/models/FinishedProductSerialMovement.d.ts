export type FinishedProductSerialMovement = {
    batchNo?: string | null;
    companyId: string;
    createdAt: string;
    fromStatus?: FinishedProductSerialMovement.fromStatus | null;
    id: string;
    movementType: FinishedProductSerialMovement.movementType;
    referenceId?: string | null;
    referenceType?: string | null;
    remarks?: string | null;
    serialId: string;
    stockTransactionId?: string | null;
    toStatus: FinishedProductSerialMovement.toStatus;
    updatedAt: string;
};
export declare namespace FinishedProductSerialMovement {
    enum fromStatus {
        ALLOCATED = "allocated",
        PRODUCED = "produced",
        IN_STOCK = "in_stock",
        SHIPPED = "shipped",
        SCRAPPED = "scrapped",
        VOIDED = "voided"
    }
    enum movementType {
        ALLOCATED = "allocated",
        PRODUCED = "produced",
        RECEIVED = "received",
        SHIPPED = "shipped",
        REVERSED = "reversed",
        SCRAPPED = "scrapped",
        VOIDED = "voided"
    }
    enum toStatus {
        ALLOCATED = "allocated",
        PRODUCED = "produced",
        IN_STOCK = "in_stock",
        SHIPPED = "shipped",
        SCRAPPED = "scrapped",
        VOIDED = "voided"
    }
}
