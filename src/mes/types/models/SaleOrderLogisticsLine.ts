/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FreightPayer } from './FreightPayer';
export type SaleOrderLogisticsLine = {
    createdAt: string;
    /**
     * 运费条款/承担方（非应收权威）
     */
    freightPayer?: FreightPayer | null;
    id: string;
    /**
     * 交付要求行号
     */
    lineNo: number;
    /**
     * 指定承运商/物流公司（非实际物流事实）
     */
    logisticsCarrier?: string | null;
    /**
     * 运输/交付方式
     */
    logisticsMethod?: string | null;
    /**
     * 交付说明/运输备注
     */
    logisticsRemarks?: string | null;
    order?: Record<string, any>;
    /**
     * 销售订单ID
     */
    orderId: string;
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
    /**
     * 适用的销售订单明细行ID列表；为空表示适用于整张订单
     */
    saleOrderItemIds?: Array<string>;
    updatedAt: string;
};
