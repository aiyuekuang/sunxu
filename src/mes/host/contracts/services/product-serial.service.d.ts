import type { AvailableProductSerialsDto } from '../generated/models/AvailableProductSerialsDto.d.ts';
import type { BatchProductSerialListItemDto } from '../generated/models/BatchProductSerialListItemDto.d.ts';
import type { FinishedProductSerialDto } from '../generated/models/FinishedProductSerialDto.d.ts';
import type { FinishedProductSerialTraceDto } from '../generated/models/FinishedProductSerialTraceDto.d.ts';
export type BatchProductSerialListItem = BatchProductSerialListItemDto;
export interface BatchProductSerialPage {
    list: BatchProductSerialListItem[];
    page: number;
    pageSize: number;
    total: number;
}
export declare const productSerialService: {
    trace: (serialNo: string) => Promise<FinishedProductSerialTraceDto>;
    listAvailableForShipment: (dto: AvailableProductSerialsDto) => Promise<FinishedProductSerialDto[]>;
    listForWorkOrder: (workOrderId: string) => Promise<FinishedProductSerialDto[]>;
    listForBatch: (batchId: string, page?: number, pageSize?: number) => Promise<BatchProductSerialPage>;
};
