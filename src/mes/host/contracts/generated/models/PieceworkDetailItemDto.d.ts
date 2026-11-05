import type { ProductionWageSettlementStatus } from './ProductionWageSettlementStatus.d.ts';
export type PieceworkDetailItemDto = {
    /**
     * 辅操工价比例快照
     */
    auxiliaryPriceRatioSnapshot?: number | null;
    /**
     * 批次号
     */
    batchNo?: string | null;
    /**
     * 完成数量
     */
    completedQty: number;
    /**
     * 本次计时工时（分钟）
     */
    durationMinutes: number;
    /**
     * 加工计数执行量
     */
    executionQty: number;
    /**
     * 加工计数单位
     */
    executionUnit?: string | null;
    /**
     * 记录ID
     */
    id: string;
    /**
     * 是否辅操报工
     */
    isAuxiliary: boolean;
    /**
     * 物料档案编码
     */
    materialCode?: string | null;
    /**
     * 物料档案名称
     */
    materialName?: string | null;
    /**
     * 工序名称
     */
    operationName?: string | null;
    /**
     * 计薪方式（piece/time）
     */
    payMode: string;
    /**
     * 计件单价
     */
    pieceRate: number;
    /**
     * 计件数量基准：product_qty/operation_report_qty
     */
    pieceworkQtyBasis: string;
    /**
     * 数量角色（output/execution/time）
     */
    quantityRole: string;
    /**
     * 报工时间
     */
    reportedAt: string;
    /**
     * 工序报工量
     */
    reportedOperationQty: number;
    /**
     * 工序报工单位
     */
    reportedOperationUnit?: string | null;
    /**
     * 报废数量
     */
    scrappedQty: number;
    /**
     * 该报工工资事实的结算进度
     */
    settlementStatus: ProductionWageSettlementStatus;
    /**
     * 班次编码
     */
    shiftCode?: string | null;
    /**
     * 班次名称
     */
    shiftName?: string | null;
    /**
     * 班次薪资系数
     */
    shiftWageMultiplier: number;
    /**
     * 计时单价
     */
    timeRate?: number | null;
    /**
     * 计时单价单位
     */
    timeRateUnit?: string | null;
    /**
     * 类型（report/revoke）
     */
    type: string;
    /**
     * 工资金额
     */
    wage: number;
    /**
     * 关联的有效结算单ID
     */
    wageStatementId?: string | null;
    /**
     * 关联的有效结算单号
     */
    wageStatementNo?: string | null;
    /**
     * 工资计算状态：calculated/pending
     */
    wageStatus: string;
    /**
     * 工单号
     */
    workOrderNo: string;
};
