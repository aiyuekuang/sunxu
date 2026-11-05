/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Customer } from './Customer';
import type { FreightPayer } from './FreightPayer';
import type { Quotation } from './Quotation';
import type { SaleOrderFulfillmentScenario } from './SaleOrderFulfillmentScenario';
import type { SaleOrderItem } from './SaleOrderItem';
import type { SaleOrderLogisticsLine } from './SaleOrderLogisticsLine';
import type { SaleOrderSettlementMode } from './SaleOrderSettlementMode';
import type { SaleOrderStatus } from './SaleOrderStatus';
import type { User } from './User';
export type SaleOrder = {
    /**
     * 地址快照
     */
    addressSnapshot?: string | null;
    /**
     * 订单附件URL
     */
    attachmentUrls?: Array<string>;
    /**
     * 当前销售订单允许的业务操作
     */
    availableActions?: Array<string>;
    companyId: string;
    /**
     * 确认时间
     */
    confirmedAt?: string | null;
    /**
     * 确认人ID
     */
    confirmedBy?: string | null;
    /**
     * 确认人
     */
    confirmer?: User | null;
    /**
     * 联系人快照
     */
    contactNameSnapshot?: string | null;
    /**
     * 联系电话快照
     */
    contactPhoneSnapshot?: string | null;
    /**
     * 合同文件URL
     */
    contractUrls?: Array<string>;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    customer?: Customer | null;
    customerId?: string | null;
    deliveryDate?: string | null;
    /**
     * 运费条款/承担方（非应收权威）
     */
    freightPayer?: FreightPayer | null;
    /**
     * 履约场景；客户样品仍使用销售订单主链路执行
     */
    fulfillmentScenario: SaleOrderFulfillmentScenario;
    id: string;
    items?: Array<SaleOrderItem>;
    /**
     * 交付要求：指定承运商/物流公司（非实际物流事实）
     */
    logisticsCarrier?: string | null;
    /**
     * 销售订单交付要求明细（历史兼容字段，非实际物流）
     */
    logisticsLines?: Array<SaleOrderLogisticsLine>;
    /**
     * 交付要求：运输/交付方式
     */
    logisticsMethod?: string | null;
    /**
     * 交付说明/运输备注
     */
    logisticsRemarks?: string | null;
    orderNo: string;
    /**
     * 往来方名称快照
     */
    partnerNameSnapshot?: string | null;
    paymentTerms?: string | null;
    /**
     * 预估/约定运费金额（非应收权威）
     */
    plannedFreightAmount?: number | null;
    /**
     * 预估/约定运费币种
     */
    plannedFreightCurrency?: string | null;
    /**
     * 客户参考单号/预约单号（非实际物流单号）
     */
    plannedTrackingNo?: string | null;
    quotation?: Quotation | null;
    quotationId?: string | null;
    remarks?: string | null;
    salesRep?: User | null;
    salesRepId?: string | null;
    /**
     * 结算方式；免费客户样品由订单行全额折让实现
     */
    settlementMode: SaleOrderSettlementMode;
    status: SaleOrderStatus;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
