import type { SaleOrderItemDto } from './SaleOrderItemDto.d.ts';
import type { SaleOrderLogisticsLineDto } from './SaleOrderLogisticsLineDto.d.ts';
export type CreateSaleOrderDto = {
    /**
     * 订单附件URL
     */
    attachmentUrls?: Array<string>;
    /**
     * 合同文件URL
     */
    contractUrls?: Array<string>;
    /**
     * 前端当前销售订单表头自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 销售订单表头自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 客户ID
     */
    customerId?: string;
    /**
     * 交货日期，格式 YYYY-MM-DD
     */
    deliveryDate?: string;
    /**
     * 运费条款/承担方（非应收权威）
     */
    freightPayer?: CreateSaleOrderDto.freightPayer;
    /**
     * 履约场景；客户样品仍使用销售订单、生产计划、工单和出库主链路执行
     */
    fulfillmentScenario?: CreateSaleOrderDto.fulfillmentScenario;
    items?: Array<SaleOrderItemDto>;
    /**
     * 指定承运商/物流公司（交付要求，非实际物流）
     */
    logisticsCarrier?: string;
    /**
     * 销售订单交付要求明细（历史兼容字段）；为空时不填写结构化交付要求
     */
    logisticsLines?: Array<SaleOrderLogisticsLineDto>;
    /**
     * 运输/交付方式
     */
    logisticsMethod?: string;
    /**
     * 交付说明/运输备注
     */
    logisticsRemarks?: string;
    /**
     * 销售订单号（留空则自动生成）
     */
    orderNo?: string;
    /**
     * 收款条件（不传则从客户自动带入）
     */
    paymentTerms?: string;
    /**
     * 预估/约定运费金额（非应收权威）
     */
    plannedFreightAmount?: number | null;
    /**
     * 预估/约定运费币种
     */
    plannedFreightCurrency?: string;
    /**
     * 客户参考单号/预约单号（非实际物流单号）
     */
    plannedTrackingNo?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 销售员ID
     */
    salesRepId?: string;
    /**
     * 结算方式；免费客户样品会保留正数标准价并由系统强制全额折让，不会写回销售价目
     */
    settlementMode?: CreateSaleOrderDto.settlementMode;
    /**
     * 创建后是否立即提交审批；不传时保持历史兼容行为，由系统按公司审批配置处理
     */
    submitApproval?: boolean;
};
export declare namespace CreateSaleOrderDto {
    /**
     * 运费条款/承担方（非应收权威）
     */
    enum freightPayer {
        CUSTOMER = "customer",
        COMPANY = "company",
        COLLECT = "collect",
        THIRD_PARTY = "third_party"
    }
    /**
     * 履约场景；客户样品仍使用销售订单、生产计划、工单和出库主链路执行
     */
    enum fulfillmentScenario {
        NORMAL_SALE = "normal_sale",
        CUSTOMER_SAMPLE = "customer_sample"
    }
    /**
     * 结算方式；免费客户样品会保留正数标准价并由系统强制全额折让，不会写回销售价目
     */
    enum settlementMode {
        CHARGED = "charged",
        FREE = "free"
    }
}
