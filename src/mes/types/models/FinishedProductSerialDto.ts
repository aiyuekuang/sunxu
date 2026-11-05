/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FinishedProductSerialDto = {
    batchId?: string | null;
    batchNo?: string | null;
    demandLineId?: string | null;
    id: string;
    materialId: string;
    producedAt?: string | null;
    receivedAt?: string | null;
    serialNo: string;
    shippedAt?: string | null;
    status: FinishedProductSerialDto.status;
    warehouseId?: string | null;
    workOrderId: string;
};
export namespace FinishedProductSerialDto {
    export enum status {
        ALLOCATED = 'allocated',
        PRODUCED = 'produced',
        IN_STOCK = 'in_stock',
        SHIPPED = 'shipped',
        SCRAPPED = 'scrapped',
        VOIDED = 'voided',
    }
}
