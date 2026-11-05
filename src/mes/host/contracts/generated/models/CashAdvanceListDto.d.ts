import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type CashAdvanceListDto = {
    /**
     * 借支对象ID
     */
    counterpartyId?: string;
    /**
     * 结束业务日期 YYYY-MM-DD
     */
    endDate?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: CashAdvanceListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 起始业务日期 YYYY-MM-DD
     */
    startDate?: string;
    /**
     * 状态
     */
    status?: CashAdvanceListDto.status;
};
export declare namespace CashAdvanceListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * 状态
     */
    enum status {
        DRAFT = "draft",
        SUBMITTED = "submitted",
        APPROVED = "approved",
        DISBURSED = "disbursed",
        PARTIALLY_SETTLED = "partially_settled",
        SETTLED = "settled",
        CANCELLED = "cancelled"
    }
}
