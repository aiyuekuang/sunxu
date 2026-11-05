import type { QuotationItemDto } from './QuotationItemDto.d.ts';
export type CreateQuotationDto = {
    /**
     * 客户ID
     */
    customerId?: string;
    /**
     * 报价明细
     */
    items: Array<QuotationItemDto>;
    /**
     * 收款条件（不传则从客户自动带入）
     */
    paymentTerms?: string;
    /**
     * 报价日期
     */
    quotationDate?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 销售员ID
     */
    salesRepId?: string;
    /**
     * 有效期至
     */
    validUntil?: string;
};
