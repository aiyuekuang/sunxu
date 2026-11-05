import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type PRListDto = {
    /**
     * 制单日期（YYYY-MM-DD）
     */
    documentDate?: string;
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
    orderDir?: PRListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 请购单号（模糊搜索）
     */
    prNo?: string;
    status?: PRListDto.status;
    /**
     * 采购申请状态（可多选）
     */
    statuses?: Array<'draft' | 'submitted' | 'approved' | 'rejected' | 'ordered' | 'cancelled' | 'closed'>;
};
export declare namespace PRListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    enum status {
        DRAFT = "draft",
        SUBMITTED = "submitted",
        APPROVED = "approved",
        REJECTED = "rejected",
        ORDERED = "ordered",
        CANCELLED = "cancelled",
        CLOSED = "closed"
    }
}
