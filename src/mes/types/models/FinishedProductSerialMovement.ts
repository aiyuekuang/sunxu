/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
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
export namespace FinishedProductSerialMovement {
    export enum fromStatus {
        ALLOCATED = 'allocated',
        PRODUCED = 'produced',
        IN_STOCK = 'in_stock',
        SHIPPED = 'shipped',
        SCRAPPED = 'scrapped',
        VOIDED = 'voided',
    }
    export enum movementType {
        ALLOCATED = 'allocated',
        PRODUCED = 'produced',
        RECEIVED = 'received',
        SHIPPED = 'shipped',
        REVERSED = 'reversed',
        SCRAPPED = 'scrapped',
        VOIDED = 'voided',
    }
    export enum toStatus {
        ALLOCATED = 'allocated',
        PRODUCED = 'produced',
        IN_STOCK = 'in_stock',
        SHIPPED = 'shipped',
        SCRAPPED = 'scrapped',
        VOIDED = 'voided',
    }
}
