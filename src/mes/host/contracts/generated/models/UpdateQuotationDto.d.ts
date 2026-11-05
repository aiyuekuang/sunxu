import type { QuotationItemDto } from './QuotationItemDto.d.ts';
export type UpdateQuotationDto = {
    /**
     * 客户ID
     */
    customerId?: string;
    /**
     * 报价单ID
     */
    id: string;
    /**
     * 报价明细
     */
    items?: Array<QuotationItemDto>;
    /**
     * 收款条件
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
