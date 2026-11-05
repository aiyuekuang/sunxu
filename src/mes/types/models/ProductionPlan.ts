/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomHeader } from './BomHeader';
import type { Customer } from './Customer';
import type { Material } from './Material';
import type { ProcessRoute } from './ProcessRoute';
import type { ProductionPlanSourceDemandType } from './ProductionPlanSourceDemandType';
import type { ProductionPlanStatus } from './ProductionPlanStatus';
import type { ProductionPlanStockNettingMode } from './ProductionPlanStockNettingMode';
import type { ProductionQtyRoundingMode } from './ProductionQtyRoundingMode';
import type { SaleOrder } from './SaleOrder';
import type { SaleOrderItem } from './SaleOrderItem';
import type { User } from './User';
export type ProductionPlan = {
    actualEndDate?: string | null;
    actualStartDate?: string | null;
    /**
     * 审批提交时间标记。
     *
     * 生产计划审批期间按产品口径仍保持 draft，不能用 status 区分普通草稿
     * 与已提交审批的计划；该字段是审批提交事实的唯一持久化标记，仅由后端
     * 审批入口写入/清空，客户端不可编辑。
     */
    approvalSubmittedAt: string | null;
    /**
     * 来源订单/报价 BOM 成本快照
     */
    bomCostSnapshot?: Record<string, any> | null;
    bomHeader?: BomHeader | null;
    bomHeaderId?: string | null;
    /**
     * 关闭原因（人工关闭备注或系统自动关闭说明；需求未满足即关闭时承载短完差异口径）
     */
    closeReason?: string | null;
    companyId: string;
    completedQty: number;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 非标参数快照，如尺寸、工艺要求、客户要求等
     */
    customSnapshot?: Record<string, any>;
    customer?: Customer | null;
    customerId?: string | null;
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
     * 创建计划时冻结的投产数量取整方式
     */
    productionQtyRoundingMode: ProductionQtyRoundingMode;
    requiredQty: number;
    route?: ProcessRoute | null;
    routeId?: string | null;
    saleOrder?: SaleOrder | null;
    saleOrderId?: string | null;
    saleOrderItem?: SaleOrderItem | null;
    saleOrderItemId?: string | null;
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
};
