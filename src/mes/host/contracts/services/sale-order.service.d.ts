import type { ListSaleOrderDto } from '../generated/models/ListSaleOrderDto.d.ts';
import type { CopySaleOrderDto } from '../generated/models/CopySaleOrderDto.d.ts';
import type { CreateSaleOrderDto as GeneratedCreateSaleOrderDto } from '../generated/models/CreateSaleOrderDto.d.ts';
import type { SaleOrderItem as GeneratedSaleOrderItem } from '../generated/models/SaleOrderItem.d.ts';
import type { SaleOrderItemDto as GeneratedSaleOrderItemDto } from '../generated/models/SaleOrderItemDto.d.ts';
import type { BatchConvertToProductionDto as GeneratedBatchConvertToProductionDto } from '../generated/models/BatchConvertToProductionDto.d.ts';
import type { BatchConvertToProductionResultDto } from '../generated/models/BatchConvertToProductionResultDto.d.ts';
import type { ConvertItemDto as GeneratedConvertItemDto } from '../generated/models/ConvertItemDto.d.ts';
import type { SaleOrderConvertInfoItemDto } from '../generated/models/SaleOrderConvertInfoItemDto.d.ts';
import type { SaleOrderConvertInfoResponseDto } from '../generated/models/SaleOrderConvertInfoResponseDto.d.ts';
import { SaleOrderFulfillmentScenario } from '../generated/models/SaleOrderFulfillmentScenario.d.ts';
import { SaleOrderSettlementMode } from '../generated/models/SaleOrderSettlementMode.d.ts';
export type SaleOrderStatus = 'draft' | 'submitted' | 'confirmed' | 'production_pending' | 'ready_to_start' | 'in_production' | 'partially_shipped' | 'shipped' | 'completed' | 'cancelled';
import type { SaleOrder as SaleOrderGenerated } from '../generated/models/SaleOrder.d.ts';
export type { CopySaleOrderDto } from '../generated/models/CopySaleOrderDto.d.ts';
type CustomerMaterialSnapshotFields = {
    customerMaterialCode?: string | null;
    customerMaterialName?: string | null;
    customerMaterialSpec?: string | null;
};
export type SaleOrderItem = GeneratedSaleOrderItem & CustomerMaterialSnapshotFields;
export type SaleOrder = Omit<SaleOrderGenerated, 'items'> & {
    totalAmount?: number | null;
    remainingDeliveryQtyTotal?: number | null;
    hasRemainingDeliveryQty?: boolean | null;
    hasReturn?: boolean;
    returnedQtyTotal?: number;
    isFullyReturned?: boolean;
    items?: SaleOrderItem[];
};
export type SaleOrderItemDto = GeneratedSaleOrderItemDto & CustomerMaterialSnapshotFields;
type SaleOrderLogisticsPayloadKey = 'freightPayer' | 'logisticsCarrier' | 'logisticsLines' | 'logisticsMethod' | 'logisticsRemarks' | 'plannedFreightAmount' | 'plannedFreightCurrency' | 'plannedTrackingNo';
export interface CreateSaleOrderDto extends Omit<GeneratedCreateSaleOrderDto, 'items' | SaleOrderLogisticsPayloadKey | 'fulfillmentScenario' | 'settlementMode'> {
    fulfillmentScenario?: SaleOrderFulfillmentScenario;
    items?: SaleOrderItemDto[];
    settlementMode?: SaleOrderSettlementMode;
}
export type ConvertInfoItem = SaleOrderConvertInfoItemDto;
export type ConvertInfoResult = SaleOrderConvertInfoResponseDto;
export type ConvertItemInputDto = Omit<GeneratedConvertItemDto, 'sourceDemandType' | 'stockNettingMode'> & {
    sourceDemandType?: unknown;
    stockNettingMode?: unknown;
};
export type BatchConvertToProductionDto = Omit<GeneratedBatchConvertToProductionDto, 'items'> & {
    items: ConvertItemInputDto[];
};
export type BatchConvertResult = BatchConvertToProductionResultDto;
export type SaleOrderListParams = ListSaleOrderDto;
export interface SaleOrderListResult {
    list: SaleOrder[];
    total: number;
    page: number;
    pageSize: number;
    totalAmount?: number;
}
export interface UpdateSaleOrderDto extends CreateSaleOrderDto {
    id: string;
}
export declare const saleOrderService: {
    /** 覆盖 list：保留后端返回的 totalAmount 额外字段 */
    list(params?: ListSaleOrderDto): Promise<SaleOrderListResult>;
    create: (dto: CreateSaleOrderDto) => Promise<SaleOrder>;
    update: (dto: UpdateSaleOrderDto) => Promise<SaleOrder>;
    confirm(id: string): Promise<void>;
    cancel(id: string): Promise<void>;
    getConvertInfo(saleOrderId: string, planStartDate?: string): Promise<ConvertInfoResult>;
    batchConvertToProduction(dto: BatchConvertToProductionDto): Promise<BatchConvertResult>;
    copy: (dto: CopySaleOrderDto) => import("../../../types/generated/index").Promise<SaleOrderGenerated>;
    detail(id: string): Promise<SaleOrder>;
};
