import type { ListPurchaseOrderDetailDto } from '../generated/models/ListPurchaseOrderDetailDto.d.ts';
import type { ListPurchaseOrderDto } from '../generated/models/ListPurchaseOrderDto.d.ts';
import type { PurchaseOrderDetailListResponseDto } from '../generated/models/PurchaseOrderDetailListResponseDto.d.ts';
import type { CreatePurchaseOrderDto } from '../generated/models/CreatePurchaseOrderDto.d.ts';
import type { UpdatePurchaseOrderBodyDto } from '../generated/models/UpdatePurchaseOrderBodyDto.d.ts';
import type { SendPurchaseOrderDto } from '../generated/models/SendPurchaseOrderDto.d.ts';
import type { PurchaseOrderSendOptionsResponseDto } from '../generated/models/PurchaseOrderSendOptionsResponseDto.d.ts';
export type PurchaseOrderStatus = 'draft' | 'submitted' | 'confirmed' | 'partially_received' | 'received' | 'completed' | 'cancelled';
import type { PurchaseOrder as PurchaseOrderGenerated } from '../generated/models/PurchaseOrder.d.ts';
export interface PurchaseOrderActionHint {
    enabled: boolean;
    reason?: string;
    impacts?: Array<{
        type: 'purchase_receipt';
        id: string;
        no: string;
    }>;
}
export type PurchaseOrder = PurchaseOrderGenerated & {
    totalAmount?: number | null;
    itemCount?: number | null;
    availableActions?: string[];
    actionHints?: {
        cancel?: PurchaseOrderActionHint;
        complete?: PurchaseOrderActionHint;
        reopen?: PurchaseOrderActionHint;
    };
};
export type { PurchaseOrderSendOptionsResponseDto } from '../generated/models/PurchaseOrderSendOptionsResponseDto.d.ts';
export type { PurchaseOrderSendOptionDto } from '../generated/models/PurchaseOrderSendOptionDto.d.ts';
export { PurchaseOrderSendChannel } from '../generated/models/PurchaseOrderSendChannel.d.ts';
export type PurchaseOrderListParams = ListPurchaseOrderDto;
export type { ListPurchaseOrderDetailDto, PurchaseOrderDetailListResponseDto };
export interface PurchaseOrderListResult {
    list: PurchaseOrder[];
    total: number;
    page: number;
    pageSize: number;
}
export declare const purchaseOrderService: {
    listDetail(params: ListPurchaseOrderDetailDto): Promise<PurchaseOrderDetailListResponseDto>;
    confirm(id: string): Promise<void>;
    cancel(id: string): Promise<void>;
    complete(id: string, reason?: string): Promise<void>;
    reopen(id: string, reason: string): Promise<void>;
    send(params: SendPurchaseOrderDto): Promise<void>;
    sendOptions(id: string): Promise<PurchaseOrderSendOptionsResponseDto>;
    list: (params?: ListPurchaseOrderDto | undefined) => Promise<import("./_base.d.ts").PaginatedList<PurchaseOrder>>;
    detail: (id: string) => Promise<PurchaseOrder>;
    create: (dto: CreatePurchaseOrderDto) => Promise<PurchaseOrder>;
    update: (dto: UpdatePurchaseOrderBodyDto) => Promise<PurchaseOrder>;
    delete: (id: string) => Promise<unknown>;
};
