import type { FinishedProductSerialMovement } from './FinishedProductSerialMovement.d.ts';
import type { FinishedProductSerialProductionReceiptDto } from './FinishedProductSerialProductionReceiptDto.d.ts';
import type { FinishedProductSerialProductionReportDto } from './FinishedProductSerialProductionReportDto.d.ts';
import type { FinishedProductSerialShipmentDto } from './FinishedProductSerialShipmentDto.d.ts';
import type { FinishedProductSerialSourceDemandDto } from './FinishedProductSerialSourceDemandDto.d.ts';
import type { FinishedProductSerialWarehouseDto } from './FinishedProductSerialWarehouseDto.d.ts';
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
export declare namespace FinishedProductSerialTraceDto {
    enum status {
        ALLOCATED = "allocated",
        PRODUCED = "produced",
        IN_STOCK = "in_stock",
        SHIPPED = "shipped",
        SCRAPPED = "scrapped",
        VOIDED = "voided"
    }
}
