/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomHeader } from './BomHeader';
import type { ManufactureMode } from './ManufactureMode';
import type { Material } from './Material';
export type SaleOrderItem = {
    amount: number;
    /**
     * 订单确认时 BOM 成本快照
     */
    bomCostSnapshot?: Record<string, any> | null;
    bomHeader?: BomHeader | null;
    /**
     * 订单行默认使用的 BOM 版本ID
     */
    bomHeaderId?: string | null;
    /**
     * BOM 选择原因
     */
    bomSelectionReason?: string | null;
    /**
     * BOM 选择来源
     */
    bomSelectionSource?: string | null;
    /**
     * 行关闭原因
     */
    cancelReason?: string | null;
    /**
     * 行关闭时间
     */
    cancelledAt?: string | null;
    /**
     * 行关闭操作人ID
     */
    cancelledBy?: string | null;
    /**
     * 已关闭/取消数量（客户砍单等原因关闭的剩余未生产需求，不再驱动转计划与完工判定）
     */
    cancelledQty: number;
    createdAt: string;
    /**
     * 非标参数快照，如尺寸、工艺要求、客户要求等
     */
    customSnapshot?: Record<string, any>;
    /**
     * 客户料号快照
     */
    customerMaterialCode?: string | null;
    /**
     * 客户物料名称快照
     */
    customerMaterialName?: string | null;
    /**
     * 客户规格/型号快照
     */
    customerMaterialSpec?: string | null;
    /**
     * 明细交货日期，格式 YYYY-MM-DD；为空时回退订单头交货日期。下游转生产计划 dueDate 已按明细优先取值（明细交货日期 ?? 订单头交货日期）→ 工单 dueDate；出货侧按需展示明细交货日期，不做后端逾期阻断。
     */
    deliveryDate?: string | null;
    /**
     * 折扣金额
     */
    discountAmount?: number | null;
    /**
     * 折扣率（%），100 表示无折扣
     */
    discountRate: number;
    /**
     * 折后未税金额
     */
    discountedAmount?: number | null;
    /**
     * 订单行级图纸附件URL快照
     */
    drawingUrls?: Array<string>;
    /**
     * 订单行执行摘要，按计划需求、工单、库存流水、质检、出库退货事实派生，不落库
     */
    executionSummary?: Record<string, any>;
    id: string;
    /**
     * 行序号（保持用户录入顺序，从 1 递增）。排序优先按 lineNo，历史行 lineNo=0 时回退 createdAt→id
     */
    lineNo: number;
    /**
     * 制造模式：标准、按单、工程按单、项目型
     */
    manufactureMode: ManufactureMode;
    material?: Material;
    materialId: string;
    order?: Record<string, any>;
    orderId: string;
    /**
     * 价格例外审批ID
     */
    priceExceptionApprovalId?: string | null;
    /**
     * 单价是否含税
     */
    priceIncludesTax?: boolean | null;
    /**
     * 价格来源快照
     */
    priceSnapshot?: Record<string, any> | null;
    quantity: number;
    /**
     * 剩余可出库数量 = 订单量 − 毛占用（含草稿/审批中销售出库单占用，防止退货自动恢复原订单待发数量）；存在草稿销售出库单时 shippedQty + remainingQty 可能小于订购量，差额为占用待出库
     */
    remainingQty?: number;
    remarks?: string | null;
    /**
     * 已完成退货数量（已退回入库，不增加原销售订单的待发数量）
     */
    returnedQty?: number;
    selectedBomHeader?: BomHeader | null;
    /**
     * 本订单行确认使用的 BOM 版本ID
     */
    selectedBomHeaderId?: string | null;
    /**
     * 净已发货数量（已确认销售出库数量减已完成退货，用于查看实际净交付；订单履约状态仍按已确认出库原数量派生，退货不会恢复原订单待发承诺）
     */
    shippedQty?: number;
    /**
     * 税额
     */
    taxAmount?: number | null;
    /**
     * 税率（%）
     */
    taxRate?: number | null;
    /**
     * 总金额（价税合计）
     */
    totalAmount?: number | null;
    unitPrice?: number | null;
    updatedAt: string;
};
