/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PurchaseInquiryAward } from './PurchaseInquiryAward';
import type { PurchaseInquiryItem } from './PurchaseInquiryItem';
import type { PurchaseInquiryStatus } from './PurchaseInquiryStatus';
import type { PurchaseInquirySupplier } from './PurchaseInquirySupplier';
import type { PurchaseRequisition } from './PurchaseRequisition';
import type { User } from './User';
export type PurchaseInquiry = {
    /**
     * 定标总金额；无价格查看权限时为空
     */
    awardAmount?: number | null;
    /**
     * 定标原因
     */
    awardReason?: string | null;
    /**
     * 定标时间
     */
    awardedAt?: string | null;
    awardedBy?: User | null;
    /**
     * 定标人ID
     */
    awardedById?: string | null;
    /**
     * 定标记录
     */
    awards?: Array<PurchaseInquiryAward>;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    id: string;
    /**
     * 询价单号
     */
    inquiryNo: string;
    /**
     * 询价明细
     */
    items?: Array<PurchaseInquiryItem>;
    /**
     * 报价截止日期
     */
    quoteDeadline?: string | null;
    /**
     * 询价说明/备注
     */
    remarks?: string | null;
    requestedBy?: User | null;
    /**
     * 询价发起人ID
     */
    requestedById?: string | null;
    requisition?: PurchaseRequisition | null;
    /**
     * 来源采购申请ID
     */
    requisitionId?: string | null;
    /**
     * 标记发送时间
     */
    sentAt?: string | null;
    sentBy?: User | null;
    /**
     * 标记发送人ID
     */
    sentById?: string | null;
    /**
     * 询价状态
     */
    status: PurchaseInquiryStatus;
    /**
     * 候选供应商
     */
    suppliers?: Array<PurchaseInquirySupplier>;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
