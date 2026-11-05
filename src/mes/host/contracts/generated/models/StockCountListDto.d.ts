import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type StockCountListDto = {
    /**
     * 审核时间结束
     */
    approvedEndDate?: string;
    /**
     * 审核时间开始
     */
    approvedStartDate?: string;
    /**
     * 盘点业务日期结束
     */
    countDateEnd?: string;
    /**
     * 盘点业务日期开始
     */
    countDateStart?: string;
    /**
     * 盘点方式；open=明盘，blind=盲盘
     */
    countMode?: StockCountListDto.countMode;
    /**
     * 盘点单号（模糊搜索）
     */
    countNo?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 仓位ID
     */
    locationId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: StockCountListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 盘点状态
     */
    status?: StockCountListDto.status;
    /**
     * 盘点状态（可多选）
     */
    statuses?: Array<'draft' | 'counting' | 'submitted' | 'approved' | 'reversed' | 'cancelled'>;
    /**
     * 提交时间结束
     */
    submittedEndDate?: string;
    /**
     * 提交时间开始
     */
    submittedStartDate?: string;
    /**
     * 仓库ID
     */
    warehouseId?: string;
};
export declare namespace StockCountListDto {
    /**
     * 盘点方式；open=明盘，blind=盲盘
     */
    enum countMode {
        OPEN = "open",
        BLIND = "blind"
    }
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * 盘点状态
     */
    enum status {
        DRAFT = "draft",
        COUNTING = "counting",
        SUBMITTED = "submitted",
        APPROVED = "approved",
        REVERSED = "reversed",
        CANCELLED = "cancelled"
    }
}
