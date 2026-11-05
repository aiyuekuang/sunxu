import type { SaleDeliveryItemDto } from './SaleDeliveryItemDto.d.ts';
export type ShipSaleDeliveryDto = {
    /**
     * 出库附件URL
     */
    attachmentUrls?: Array<string>;
    /**
     * 保存后立即自动确认出库（跳过独立 confirm 操作）。仅适用于不需要审批门禁的单据；若 requiresApproval=true 直接拒绝。
     */
    autoConfirm?: boolean;
    /**
     * 销售订单出库动作客户端幂等键；同一请求重试时保持不变
     */
    clientRequestId?: string;
    /**
     * 前端当前销售出库单自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 销售出库单自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 客户ID
     */
    customerId?: string;
    /**
     * 出库日期
     */
    deliveryDate?: string;
    /**
     * 销售出库单明细行
     */
    items: Array<SaleDeliveryItemDto>;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 来源销售订单ID；有值=订单下推模式（校验订单状态/明细匹配/防超发），空=直接出库模式（客户必填；未显式人工定价时服务端按客户、物料、数量和出库日期解析价目并冻结快照；需启用运营方案「无订单直接出库」）
     */
    saleOrderId?: string;
    /**
     * 信用额度超限确认后重试时传 true；仅价格可见/有权用户可用
     */
    skipCreditCheck?: boolean;
    /**
     * 出库仓库ID
     */
    warehouseId: string;
};
