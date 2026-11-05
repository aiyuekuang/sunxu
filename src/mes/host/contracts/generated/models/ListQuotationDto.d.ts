import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ListQuotationDto = {
    customerId?: string;
    /**
     * 结束日期
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
    orderDir?: ListQuotationDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 报价单号
     */
    quotationNo?: string;
    /**
     * 开始日期
     */
    startDate?: string;
    status?: ListQuotationDto.status;
    /**
     * 报价单状态（可多选）
     */
    statuses?: Array<'draft' | 'submitted' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled'>;
};
export declare namespace ListQuotationDto {
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
        SENT = "sent",
        ACCEPTED = "accepted",
        REJECTED = "rejected",
        EXPIRED = "expired",
        CANCELLED = "cancelled"
    }
}
