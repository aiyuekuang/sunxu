import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type AllOperationsDto = {
    /**
     * 操作员ID
     */
    assigneeId?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 产出物料档案ID
     */
    materialId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: AllOperationsDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 工序状态：pending / in_progress / completed / skipped
     */
    status?: string;
    /**
     * 按工单精确过滤（下钻某工单的工序任务）
     */
    workOrderId?: string;
};
export declare namespace AllOperationsDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
}
