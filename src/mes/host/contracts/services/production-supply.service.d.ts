import type { ProductionSupplyListDto } from '../generated/models/ProductionSupplyListDto.d.ts';
import type { WorkOrderSupplySummaryItemDto } from '../generated/models/WorkOrderSupplySummaryItemDto.d.ts';
import type { ReverseProductionSupplyDto } from '../generated/models/ReverseProductionSupplyDto.d.ts';
export type ProductionSupplyBizType = 'replenish' | 'return';
export type ProductionSupplyStatus = 'draft' | 'submitted' | 'partial' | 'completed' | 'reversed' | 'cancelled';
export type { ProductionSupplyOrder } from '../generated/models/ProductionSupplyOrder.d.ts';
export type { ProductionSupplyItem } from '../generated/models/ProductionSupplyItem.d.ts';
import type { ProductionSupplyItem } from '../generated/models/ProductionSupplyItem.d.ts';
import type { ProductionSupplyOrder } from '../generated/models/ProductionSupplyOrder.d.ts';
export type ProductionSupplyListParams = Omit<ProductionSupplyListDto, 'bizType' | 'status'> & {
    bizType?: ProductionSupplyBizType;
    status?: ProductionSupplyStatus;
};
export declare const productionSupplyService: {
    list(params?: ProductionSupplyListParams): Promise<{
        list: ProductionSupplyOrder[];
        total: number;
    }>;
    detail: (id: string) => Promise<ProductionSupplyOrder>;
    create: (dto: {
        bizType: ProductionSupplyBizType;
        workOrderId: string;
        operationId?: string;
        items: Array<{
            materialReqId: string;
            plannedQty: number;
            batchNo?: string;
        }>;
        operatorId?: string;
        remarks?: string;
    }) => Promise<ProductionSupplyOrder>;
    execute: (dto: {
        id: string;
        items: Array<{
            itemId: string;
            actualQty: number;
            batchNo?: string;
        }>;
    }) => Promise<ProductionSupplyOrder>;
    cancel: (id: string) => Promise<ProductionSupplyOrder>;
    reverse: (dto: ReverseProductionSupplyDto) => Promise<ProductionSupplyOrder>;
    workOrderSummary: (workOrderId: string) => Promise<WorkOrderSupplySummaryItemDto[]>;
};
export type ProductionSupplyDetail = ProductionSupplyOrder & {
    items?: ProductionSupplyItem[];
};
