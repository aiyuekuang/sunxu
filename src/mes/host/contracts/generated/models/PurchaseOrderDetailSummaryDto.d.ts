import type { CustomFieldAggregateSummaryDto } from './CustomFieldAggregateSummaryDto.d.ts';
export type PurchaseOrderDetailSummaryDto = {
    /**
     * 采购订单明细金额合计；无价格查看权限时为空
     */
    amount?: number | null;
    /**
     * 按当前完整筛选范围计算的明细自定义字段汇总
     */
    customFieldSummaries: Array<CustomFieldAggregateSummaryDto>;
    /**
     * 采购订单明细折扣金额合计；无价格查看权限时为空
     */
    discountAmount?: number | null;
    /**
     * 采购订单明细折后未税金额合计；无价格查看权限时为空
     */
    discountedAmount?: number | null;
    /**
     * 采购订单明细行数
     */
    lineCount: number;
    /**
     * 涉及物料数
     */
    materialCount: number;
    /**
     * 订购基础数量合计
     */
    orderedQty: number;
    /**
     * 待收基础数量合计
     */
    outstandingQty: number;
    /**
     * 已收基础数量合计
     */
    receivedQty: number;
    /**
     * 采购订单明细税额合计；无价格查看权限时为空
     */
    taxAmount?: number | null;
    /**
     * 采购订单明细总金额合计（价税合计）；无价格查看权限时为空
     */
    totalAmount?: number | null;
};
