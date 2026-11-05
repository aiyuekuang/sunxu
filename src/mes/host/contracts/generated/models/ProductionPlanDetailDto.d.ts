import type { BomHeader } from './BomHeader.d.ts';
import type { Customer } from './Customer.d.ts';
import type { Material } from './Material.d.ts';
import type { PlanAchievementDto } from './PlanAchievementDto.d.ts';
import type { ProcessRoute } from './ProcessRoute.d.ts';
import type { ProductionPlanDemandLineViewDto } from './ProductionPlanDemandLineViewDto.d.ts';
import type { ProductionPlanReleaseLineViewDto } from './ProductionPlanReleaseLineViewDto.d.ts';
import type { ProductionPlanSourceDemandType } from './ProductionPlanSourceDemandType.d.ts';
import type { ProductionPlanStatus } from './ProductionPlanStatus.d.ts';
import type { ProductionPlanStockNettingMode } from './ProductionPlanStockNettingMode.d.ts';
import type { ProductionPlanWorkOrderDto } from './ProductionPlanWorkOrderDto.d.ts';
import type { ProductionQtyRoundingMode } from './ProductionQtyRoundingMode.d.ts';
import type { SaleOrder } from './SaleOrder.d.ts';
import type { SaleOrderItem } from './SaleOrderItem.d.ts';
import type { User } from './User.d.ts';
export type ProductionPlanDetailDto = {
    /**
     * 达成率汇总
     */
    achievement: PlanAchievementDto;
    actualEndDate?: string | null;
    actualStartDate?: string | null;
    /**
     * 已分配投产数量
     */
    allocatedPlannedQty: number;
    /**
     * 审批提交时间标记。
     *
     * 生产计划审批期间按产品口径仍保持 draft，不能用 status 区分普通草稿
     * 与已提交审批的计划；该字段是审批提交事实的唯一持久化标记，仅由后端
     * 审批入口写入/清空，客户端不可编辑。
     */
    approvalSubmittedAt: string | null;
    /**
     * 当前状态允许的业务操作
     */
    availableActions?: Array<string>;
    /**
     * 来源订单/报价 BOM 成本快照
     */
    bomCostSnapshot?: Record<string, any> | null;
    bomHeader?: BomHeader | null;
    bomHeaderId?: string | null;
    /**
     * 冻结标准BOM不可用于MRP的原因；可用或未冻结时为null
     */
    bomUnusableReason: string | null;
    /**
     * 冻结标准BOM是否可用于MRP；未冻结标准BOM时为null
     */
    bomUsableForMrp: boolean | null;
    /**
     * 关闭原因（人工关闭备注或系统自动关闭说明；需求未满足即关闭时承载短完差异口径）
     */
    closeReason?: string | null;
    companyId: string;
    completedQty: number;
    /**
     * 需求完成率（0-100）
     */
    completionRate: number;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 非标参数快照，如尺寸、工艺要求、客户要求等
     */
    customSnapshot?: Record<string, any>;
    customer?: Customer | null;
    customerId?: string | null;
    /**
     * 计划需求明细（多来源归集权威）
     */
    demandLines: Array<ProductionPlanDemandLineViewDto>;
    description?: string | null;
    /**
     * 计划级图纸附件URL快照
     */
    drawingUrls?: Array<string>;
    dueDate?: string | null;
    externalId?: string | null;
    externalSource?: string | null;
    id: string;
    /**
     * 计划锁定版本，已下达后变更需升版
     */
    lockVersion: number;
    /**
     * 计划确认/锁定时间
     */
    lockedAt?: string | null;
    /**
     * 计划锁定人ID
     */
    lockedBy?: string | null;
    material?: Material;
    materialId: string;
    planEndDate?: string | null;
    planNo: string;
    planStartDate?: string | null;
    plannedLossRate: number;
    plannedQty: number;
    /**
     * 最近一次计划预检摘要快照（净需求/BOM/工艺/齐套/产能/交期）
     */
    precheckSnapshot?: Record<string, any> | null;
    priority: number;
    /**
     * 生产配置提醒
     */
    productionConfigWarnings?: Array<string>;
    /**
     * 创建计划时冻结的投产数量取整方式
     */
    productionQtyRoundingMode: ProductionQtyRoundingMode;
    /**
     * 计划批次/下达明细
     */
    releaseLines: Array<ProductionPlanReleaseLineViewDto>;
    /**
     * 剩余可分配投产数量
     */
    remainingPlannedQty: number;
    /**
     * 剩余需求良品数量
     */
    remainingRequiredQty: number;
    requiredQty: number;
    /**
     * 需求是否已满足
     */
    requirementFulfilled: boolean;
    route?: ProcessRoute | null;
    routeId?: string | null;
    /**
     * 当前路线版本ID
     */
    routeVersionId?: string | null;
    /**
     * 当前路线版本展示名
     */
    routeVersionLabel?: string | null;
    saleOrder?: SaleOrder | null;
    saleOrderId?: string | null;
    saleOrderItem?: SaleOrderItem | null;
    saleOrderItemId?: string | null;
    /**
     * 报废数量
     */
    scrappedQty: number;
    /**
     * 原始来源需求数量；用于追溯库存抵扣前的需求
     */
    sourceDemandQty?: number | null;
    /**
     * 来源需求类型
     */
    sourceDemandType?: ProductionPlanSourceDemandType | null;
    sourceOrderNo?: string | null;
    /**
     * 来源销售订单行备注快照
     */
    sourceRemarkSnapshot?: string | null;
    /**
     * 来源显示摘要，如“3 张销售订单 / 3 个客户”
     */
    sourceSummary?: string | null;
    status: ProductionPlanStatus;
    /**
     * 计划库存抵扣决策模式
     */
    stockNettingMode: ProductionPlanStockNettingMode;
    /**
     * 手工指定净需求原因；仅 stockNettingMode=manual_override 时要求
     */
    stockNettingReason?: Record<string, any> | null;
    /**
     * 创建/更新计划时的净需求预览快照
     */
    stockNettingSnapshot?: Record<string, any> | null;
    /**
     * 本计划接受库存抵扣的数量；仅用于计划审计，不代表库存已预留
     */
    stockOffsetQty: number;
    /**
     * 创建计划时冻结的自制物料供应倍量；空或1表示不限制
     */
    supplyMultipleQty?: number | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    /**
     * 关联工单列表
     */
    workOrders: Array<ProductionPlanWorkOrderDto>;
};
