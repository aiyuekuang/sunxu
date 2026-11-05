import type { ProductionWageSettlementStatus } from './ProductionWageSettlementStatus.d.ts';
export type PieceworkSummaryItemDto = {
    /**
     * 员工ID
     */
    assigneeId: string;
    /**
     * 员工姓名
     */
    assigneeName?: string | null;
    /**
     * 已进入草稿结算单的条数
     */
    inProgressItemCount: number;
    /**
     * 待确认工资记录数
     */
    pendingWageCount: number;
    /**
     * 已进入已确认结算单的条数
     */
    settledItemCount: number;
    /**
     * 工资结算进度
     */
    settlementStatus: ProductionWageSettlementStatus;
    /**
     * 合格件数合计
     */
    totalQty: number;
    /**
     * 报废件数合计
     */
    totalScrappedQty: number;
    /**
     * 计时工时合计（小时）
     */
    totalTimeHours: number;
    /**
     * 计时工时合计（分钟）
     */
    totalTimeMinutes: number;
    /**
     * 应发工资合计
     */
    totalWage: number;
    /**
     * 尚未进入有效结算单的条数
     */
    unsettledItemCount: number;
    /**
     * 工资事实总条数
     */
    wageItemCount: number;
    /**
     * 工单数
     */
    workOrderCount: number;
};
