import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type AuditLogListDto = {
    /**
     * 操作类型（如 create, update, delete 等）
     */
    action?: string;
    /**
     * 结束日期 YYYY-MM-DD
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
    orderDir?: AuditLogListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 资源类型（如 work_order, equipment 等）
     */
    resource?: string;
    /**
     * 资源ID（精确匹配，如某张工单ID）
     */
    resourceId?: string;
    /**
     * 开始日期 YYYY-MM-DD
     */
    startDate?: string;
    /**
     * 操作用户ID
     */
    userId?: string;
};
export declare namespace AuditLogListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
}
