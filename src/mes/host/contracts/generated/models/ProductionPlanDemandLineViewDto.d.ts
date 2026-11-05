import type { Customer } from './Customer.d.ts';
import type { Material } from './Material.d.ts';
import type { ProductionPlan } from './ProductionPlan.d.ts';
import type { ProductionPlanDemandLineStatus } from './ProductionPlanDemandLineStatus.d.ts';
import type { ProductionPlanDemandSourceType } from './ProductionPlanDemandSourceType.d.ts';
import type { SaleOrder } from './SaleOrder.d.ts';
import type { SaleOrderItem } from './SaleOrderItem.d.ts';
export type ProductionPlanDemandLineViewDto = {
    /**
     * 来源行建议或冻结的 BOM 版本
     */
    bomHeaderId?: string | null;
    /**
     * 短完/关闭原因
     */
    closeReason?: string | null;
    companyId: string;
    createdAt: string;
    /**
     * 非标参数快照，如尺寸、工艺要求、客户要求等
     */
    customSnapshot?: Record<string, any>;
    customer?: Customer | null;
    customerId?: string | null;
    /**
     * 客户信息快照，用于显示与追溯
     */
    customerSnapshot?: Record<string, any> | null;
    /**
     * 需求行级图纸附件URL快照
     */
    drawingUrls?: Array<string>;
    dueDate?: string | null;
    /**
     * 已满足良品数量（可重算缓存，从 WorkOrderDemandAllocation 聚合派生）
     */
    fulfilledQty: number;
    id: string;
    /**
     * 计划内需求行号
     */
    lineNo: number;
    material?: Material;
    /**
     * 需求物料，必须等于计划表头产出物料
     */
    materialId: string;
    plan?: ProductionPlan;
    planId: string;
    /**
     * 按损耗率折算后的投产分摊数量
     */
    plannedQty: number;
    /**
     * 来源需求优先级 1-10
     */
    priority: number;
    /**
     * 本需求需要生产的良品数量
     */
    productionRequiredQty: number;
    /**
     * 来源行建议或冻结的工艺路线
     */
    routeId?: string | null;
    saleOrder?: SaleOrder | null;
    saleOrderId?: string | null;
    saleOrderItem?: SaleOrderItem | null;
    saleOrderItemId?: string | null;
    /**
     * 原始需求数量
     */
    sourceDemandQty: number;
    sourceOrderNo?: string | null;
    /**
     * 来源销售订单行备注快照
     */
    sourceRemarkSnapshot?: string | null;
    sourceType: ProductionPlanDemandSourceType;
    status: ProductionPlanDemandLineStatus;
    /**
     * 需求行状态中文
     */
    statusLabel?: string;
    /**
     * 本需求被库存覆盖数量
     */
    stockOffsetQty: number;
    updatedAt: string;
};
