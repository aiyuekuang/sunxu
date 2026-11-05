import type { PurchaseInquirySupplierStatus } from './PurchaseInquirySupplierStatus.d.ts';
import type { Supplier } from './Supplier.d.ts';
export type PurchaseInquirySupplier = {
    createdAt: string;
    id: string;
    /**
     * 采购询价
     */
    inquiry?: Record<string, any>;
    /**
     * 询价单ID
     */
    inquiryId: string;
    /**
     * 最近邮件发送失败原因
     */
    lastSendError?: string | null;
    /**
     * 最近邮件发送失败时间
     */
    lastSendFailedAt?: string | null;
    /**
     * 备注
     */
    remarks?: string | null;
    /**
     * 标记发送时间
     */
    sentAt?: string | null;
    /**
     * 排序号
     */
    sortOrder: number;
    /**
     * 推荐来源
     */
    sourceType?: string | null;
    /**
     * 候选供应商询价状态
     */
    status: PurchaseInquirySupplierStatus;
    supplier?: Supplier;
    /**
     * 供应商ID
     */
    supplierId: string;
    updatedAt: string;
};
