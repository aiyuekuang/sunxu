import type { BindQuotationItemMaterialsDto } from '../generated/models/BindQuotationItemMaterialsDto.d.ts';
import type { ListQuotationDto } from '../generated/models/ListQuotationDto.d.ts';
import type { CreateQuotationDto as GeneratedCreateQuotationDto } from '../generated/models/CreateQuotationDto.d.ts';
import type { UpdateQuotationDto as GeneratedUpdateQuotationDto } from '../generated/models/UpdateQuotationDto.d.ts';
import type { CopyQuotationDto } from '../generated/models/CopyQuotationDto.d.ts';
import type { SendQuotationDto } from '../generated/models/SendQuotationDto.d.ts';
import type { QuotationSendOptionsResponseDto } from '../generated/models/QuotationSendOptionsResponseDto.d.ts';
import type { QuotationItem as GeneratedQuotationItem } from '../generated/models/QuotationItem.d.ts';
import type { QuotationItemDto as GeneratedQuotationItemDto } from '../generated/models/QuotationItemDto.d.ts';
import type { Quotation as GeneratedQuotation } from '../generated/models/Quotation.d.ts';
export type QuotationStatus = 'draft' | 'submitted' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
export type { CopyQuotationDto } from '../generated/models/CopyQuotationDto.d.ts';
export type { QuotationSendOptionsResponseDto } from '../generated/models/QuotationSendOptionsResponseDto.d.ts';
export type { QuotationSendOptionDto } from '../generated/models/QuotationSendOptionDto.d.ts';
export { QuotationSendChannel } from '../generated/models/QuotationSendChannel.d.ts';
type CustomerMaterialSnapshotFields = {
    customerMaterialCode?: string | null;
    customerMaterialName?: string | null;
    customerMaterialSpec?: string | null;
};
export type QuotationItem = GeneratedQuotationItem & CustomerMaterialSnapshotFields;
export type Quotation = Omit<GeneratedQuotation, 'items'> & {
    items?: QuotationItem[];
};
export type QuotationItemDto = GeneratedQuotationItemDto & CustomerMaterialSnapshotFields;
export interface CreateQuotationDto extends Omit<GeneratedCreateQuotationDto, 'items'> {
    items: QuotationItemDto[];
}
export interface UpdateQuotationDto extends Omit<GeneratedUpdateQuotationDto, 'items'> {
    items?: QuotationItemDto[];
}
export declare const quotationService: {
    send(params: SendQuotationDto): Promise<void>;
    sendOptions(id: string): Promise<QuotationSendOptionsResponseDto>;
    cancel(id: string): Promise<void>;
    reject(id: string): Promise<void>;
    convertToOrder: (id: string) => Promise<{
        saleOrderId: string;
    }>;
    bindMaterials: (dto: BindQuotationItemMaterialsDto) => Promise<Quotation>;
    copy: (dto: CopyQuotationDto) => import("../../../types/generated/index").Promise<GeneratedQuotation>;
    list: (params?: ListQuotationDto | undefined) => Promise<import("./_base.d.ts").PaginatedList<Quotation>>;
    detail: (id: string) => Promise<Quotation>;
    create: (dto: CreateQuotationDto) => Promise<Quotation>;
    update: (dto: UpdateQuotationDto) => Promise<Quotation>;
    delete: (id: string) => Promise<unknown>;
};
