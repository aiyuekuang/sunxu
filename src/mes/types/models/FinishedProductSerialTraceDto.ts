/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinishedProductSerialMovement } from './FinishedProductSerialMovement';
import type { FinishedProductSerialProductionReceiptDto } from './FinishedProductSerialProductionReceiptDto';
import type { FinishedProductSerialProductionReportDto } from './FinishedProductSerialProductionReportDto';
import type { FinishedProductSerialShipmentDto } from './FinishedProductSerialShipmentDto';
import type { FinishedProductSerialSourceDemandDto } from './FinishedProductSerialSourceDemandDto';
import type { FinishedProductSerialWarehouseDto } from './FinishedProductSerialWarehouseDto';
export type FinishedProductSerialTraceDto = {
    batchId?: string | null;
    batchNo?: string | null;
    demandLineId?: string | null;
    id: string;
    material: Record<string, any>;
    materialId: string;
    movements: Array<FinishedProductSerialMovement>;
    producedAt?: string | null;
    productionReceipt?: FinishedProductSerialProductionReceiptDto | null;
    productionReport?: FinishedProductSerialProductionReportDto | null;
    receivedAt?: string | null;
    serialNo: string;
    shipments: Array<FinishedProductSerialShipmentDto>;
    shippedAt?: string | null;
    sourceDemand?: FinishedProductSerialSourceDemandDto | null;
    status: FinishedProductSerialTraceDto.status;
    warehouse?: FinishedProductSerialWarehouseDto | null;
    warehouseId?: string | null;
    workOrder: Record<string, any>;
    workOrderId: string;
};
export namespace FinishedProductSerialTraceDto {
    export enum status {
        ALLOCATED = 'allocated',
        PRODUCED = 'produced',
        IN_STOCK = 'in_stock',
        SHIPPED = 'shipped',
        SCRAPPED = 'scrapped',
        VOIDED = 'voided',
    }
}
