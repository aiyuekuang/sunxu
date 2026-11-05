/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PurchaseInquiry } from './PurchaseInquiry';
import type { PurchaseInquiryAward } from './PurchaseInquiryAward';
import type { PurchaseOrderItem } from './PurchaseOrderItem';
import type { PurchaseOrderSendChannel } from './PurchaseOrderSendChannel';
import type { PurchaseOrderStatus } from './PurchaseOrderStatus';
import type { PurchaseRequisition } from './PurchaseRequisition';
import type { Supplier } from './Supplier';
import type { User } from './User';
export type PurchaseOrder = {
    /**
     * 地址快照
     */
    addressSnapshot?: string | null;
    companyId: string;
    /**
     * 联系人快照
     */
    contactNameSnapshot?: string | null;
    /**
     * 联系电话快照
     */
    contactPhoneSnapshot?: string | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    expectedDate?: string | null;
    id: string;
    items?: Array<PurchaseOrderItem>;
    orderNo: string;
    /**
     * 往来方名称快照
     */
    partnerNameSnapshot?: string | null;
    paymentTerms?: string | null;
    purchasingRep?: User | null;
    purchasingRepId?: string | null;
    remarks?: string | null;
    requisition?: PurchaseRequisition | null;
    requisitionId?: string | null;
    sender?: User | null;
    sentAt?: string | null;
    sentBy?: string | null;
    sentChannel?: PurchaseOrderSendChannel | null;
    sentTarget?: string | null;
    sourceInquiry?: PurchaseInquiry | null;
    sourceInquiryAward?: PurchaseInquiryAward | null;
    /**
     * 来源定标ID
     */
    sourceInquiryAwardId?: string | null;
    /**
     * 来源采购询价ID
     */
    sourceInquiryId?: string | null;
    /**
     * 来源询价单号快照
     */
    sourceInquiryNo?: string | null;
    status: PurchaseOrderStatus;
    supplier?: Supplier | null;
    supplierId?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
