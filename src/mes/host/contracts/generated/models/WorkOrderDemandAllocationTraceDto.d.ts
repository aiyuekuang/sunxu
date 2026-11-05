import type { ProductionPlanDemandLineStatus } from './ProductionPlanDemandLineStatus.d.ts';
import type { ProductionPlanDemandSourceType } from './ProductionPlanDemandSourceType.d.ts';
export type WorkOrderDemandAllocationTraceDto = {
    /**
     * 本工单投产分摊数量
     */
    allocatedPlannedQty: number;
    /**
     * 本工单承诺覆盖的良品需求数量
     */
    allocatedRequiredQty: number;
    /**
     * 工单需求分配ID
     */
    allocationId: string;
    /**
     * 按本次报工来源归属计算的已完成良品缓存
     */
    completedGoodQty: number;
    /**
     * 需求分配创建时间
     */
    createdAt: string;
    /**
     * 客户ID
     */
    customerId?: string | null;
    /**
     * 订单行客户料号
     */
    customerMaterialCode?: string | null;
    /**
     * 订单行客户品名
     */
    customerMaterialName?: string | null;
    /**
     * 订单行客户规格
     */
    customerMaterialSpec?: string | null;
    /**
     * 客户名称
     */
    customerName?: string | null;
    /**
     * 计划需求行ID
     */
    demandLineId: string;
    /**
     * 计划需求行号
     */
    demandLineNo: number;
    /**
     * 需求行状态
     */
    demandStatus: ProductionPlanDemandLineStatus;
    /**
     * 来源需求图纸URL快照；销售订单来源对应订单明细行图纸
     */
    drawingUrls: Array<string>;
    /**
     * 需求交期
     */
    dueDate?: string | null;
    /**
     * 本工单已满足来源需求数量缓存
     */
    fulfilledQty: number;
    /**
     * 订单行物料编码快照
     */
    materialCode?: string | null;
    /**
     * 订单行物料名称快照
     */
    materialName?: string | null;
    /**
     * 需求行生产良品需求数量
     */
    productionRequiredQty: number;
    /**
     * 销售订单ID
     */
    saleOrderId?: string | null;
    /**
     * 销售订单行ID
     */
    saleOrderItemId?: string | null;
    /**
     * 来源销售订单行序号
     */
    saleOrderItemLineNo?: number | null;
    /**
     * 按本次报工来源归属计算的报废数量缓存
     */
    scrappedQty: number;
    /**
     * 来源单号
     */
    sourceOrderNo?: string | null;
    /**
     * 来源需求备注
     */
    sourceRemarkSnapshot?: string | null;
    /**
     * 来源类型
     */
    sourceType: ProductionPlanDemandSourceType;
};
