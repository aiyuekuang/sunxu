/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Customer } from './Customer';
import type { SaleDeliveryItem } from './SaleDeliveryItem';
import type { SaleDeliveryStatus } from './SaleDeliveryStatus';
import type { SaleOrder } from './SaleOrder';
import type { User } from './User';
import type { Warehouse } from './Warehouse';
export type SaleDeliveryOrder = {
    /**
     * 地址快照
     */
    addressSnapshot?: string | null;
    /**
     * 出库附件URL
     */
    attachmentUrls?: Array<string>;
    /**
     * 销售订单直接出库动作客户端幂等键；同公司内重复提交返回同一张销售出库单
     */
    clientRequestId?: string | null;
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
    customer?: Customer | null;
    customerId?: string | null;
    deliveryDate?: string | null;
    deliveryNo: string;
    id: string;
    items?: Array<SaleDeliveryItem>;
    /**
     * 往来方名称快照
     */
    partnerNameSnapshot?: string | null;
    remarks?: string | null;
    /**
     * 冲正原因
     */
    reverseReason?: string | null;
    saleOrder?: SaleOrder | null;
    saleOrderId?: string | null;
    status: SaleDeliveryStatus;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    warehouse?: Warehouse;
    warehouseId: string;
};
