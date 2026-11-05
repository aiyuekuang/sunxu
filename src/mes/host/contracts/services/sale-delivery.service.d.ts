import type { ListSaleDeliveryDto } from '../generated/models/ListSaleDeliveryDto.d.ts';
import type { CreateSaleDeliveryDto as GeneratedCreateSaleDeliveryDto } from '../generated/models/CreateSaleDeliveryDto.d.ts';
import type { SaleDeliveryItem as GeneratedSaleDeliveryItem } from '../generated/models/SaleDeliveryItem.d.ts';
import type { SaleDeliveryItemDto as GeneratedSaleDeliveryItemDto } from '../generated/models/SaleDeliveryItemDto.d.ts';
import type { SaleDeliveryExecutionItemDto as GeneratedSaleDeliveryExecutionItemDto } from '../generated/models/SaleDeliveryExecutionItemDto.d.ts';
import type { UpdateSaleDeliveryExecutionBodyDto as GeneratedUpdateSaleDeliveryExecutionBodyDto } from '../generated/models/UpdateSaleDeliveryExecutionBodyDto.d.ts';
import type { ShipSaleDeliveryDto as GeneratedShipSaleDeliveryDto } from '../generated/models/ShipSaleDeliveryDto.d.ts';
import type { ShipSaleDeliveryResponseDto } from '../generated/models/ShipSaleDeliveryResponseDto.d.ts';
import type { ReverseSaleDeliveryDto } from '../generated/models/ReverseSaleDeliveryDto.d.ts';
export type SaleDeliveryStatus = 'draft' | 'submitted' | 'delivered' | 'reversed' | 'cancelled';
import type { SaleDeliveryOrder as SaleDeliveryGenerated } from '../generated/models/SaleDeliveryOrder.d.ts';
type CustomerMaterialSnapshotFields = {
    saleOrderItemId?: string | null;
    customerMaterialCode?: string | null;
    customerMaterialName?: string | null;
    customerMaterialSpec?: string | null;
    batchNo?: string | null;
};
export type SaleDeliveryItem = Omit<GeneratedSaleDeliveryItem, 'amount' | 'unitPrice'> & {
    amount?: number | null;
    unitPrice?: number | null;
} & CustomerMaterialSnapshotFields;
export type SaleDelivery = Omit<SaleDeliveryGenerated, 'items'> & {
    totalAmount?: number | null;
    priceVisible?: boolean;
    priceEditable?: boolean;
    items?: SaleDeliveryItem[];
};
export type SaleDeliveryDetail = SaleDelivery & {
    availableActions: string[];
};
export type SaleDeliveryItemDto = Omit<GeneratedSaleDeliveryItemDto, 'unitPrice'> & {
    unitPrice?: number | null;
} & CustomerMaterialSnapshotFields;
export interface CreateSaleDeliveryDto extends Omit<GeneratedCreateSaleDeliveryDto, 'items'> {
    items: SaleDeliveryItemDto[];
}
export interface UpdateSaleDeliveryDto extends CreateSaleDeliveryDto {
    id: string;
}
export type ShipSaleDeliveryDto = GeneratedShipSaleDeliveryDto;
export type ShipSaleDeliveryResponse = ShipSaleDeliveryResponseDto;
export type SaleDeliveryExecutionItemDto = GeneratedSaleDeliveryExecutionItemDto;
export type UpdateSaleDeliveryExecutionDto = GeneratedUpdateSaleDeliveryExecutionBodyDto;
export declare const saleDeliveryService: {
    detail: (id: string) => Promise<SaleDeliveryDetail>;
    create: (dto: CreateSaleDeliveryDto) => Promise<SaleDelivery>;
    update: (dto: UpdateSaleDeliveryDto) => Promise<SaleDelivery>;
    updateExecution: (dto: UpdateSaleDeliveryExecutionDto) => Promise<SaleDeliveryDetail>;
    confirm: (id: string, skipCreditCheck?: boolean) => Promise<SaleDelivery>;
    ship: (dto: ShipSaleDeliveryDto) => Promise<ShipSaleDeliveryResponse>;
    cancel(id: string): Promise<void>;
    reverse: (dto: ReverseSaleDeliveryDto) => Promise<SaleDelivery>;
    list(params?: ListSaleDeliveryDto): Promise<import("./_base.d.ts").PaginatedList<SaleDelivery>>;
};
export {};
