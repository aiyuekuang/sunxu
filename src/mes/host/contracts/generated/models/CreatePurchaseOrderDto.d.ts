import type { PurchaseOrderItemDto } from './PurchaseOrderItemDto.d.ts';
export type CreatePurchaseOrderDto = {
    /**
     * 预计到货日期
     */
    expectedDate?: string;
    /**
     * 订单明细
     */
    items: Array<PurchaseOrderItemDto>;
    /**
     * 采购订单号（留空则自动生成）
     */
    orderNo?: string;
    /**
     * 付款条件（不传则从供应商自动带入）
     */
    paymentTerms?: string;
    /**
     * 采购员ID
     */
    purchasingRepId?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 关联采购申请ID
     */
    requisitionId?: string;
    /**
     * 创建后是否立即提交审批；传 false 时保留草稿；不传时按公司审批配置处理，保持历史兼容行为
     */
    submitApproval?: boolean;
    /**
     * 供应商ID
     */
    supplierId: string;
};
