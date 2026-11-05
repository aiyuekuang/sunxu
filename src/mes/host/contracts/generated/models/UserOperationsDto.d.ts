import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type UserOperationsDto = {
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: UserOperationsDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 工序状态
     */
    status?: string;
    /**
     * 员工ID
     */
    userId: string;
};
export declare namespace UserOperationsDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
}
