import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ProductionReceiptListDto = {
    /**
     * 批号
     */
    batchNo?: string;
    /**
     * 确认时间结束
     */
    confirmedEndDate?: string;
    /**
     * 确认时间开始
     */
    confirmedStartDate?: string;
    /**
     * 生成结束日期（YYYY-MM-DD）
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
     * 产出物料ID
     */
    materialId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: ProductionReceiptListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 生成开始日期（YYYY-MM-DD）
     */
    startDate?: string;
    status?: ProductionReceiptListDto.status;
    /**
     * 生产入库状态（可多选）
     */
    statuses?: Array<'pending' | 'received' | 'cancelled' | 'reversed'>;
    /**
     * 入库仓ID
     */
    warehouseId?: string;
    /**
     * 来源工单ID
     */
    workOrderId?: string;
};
export declare namespace ProductionReceiptListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    enum status {
        PENDING = "pending",
        RECEIVED = "received",
        CANCELLED = "cancelled",
        REVERSED = "reversed"
    }
}
