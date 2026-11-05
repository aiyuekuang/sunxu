import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type OutputBufferListDto = {
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
    orderDir?: OutputBufferListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    status?: OutputBufferListDto.status;
    /**
     * 来源工单ID
     */
    workOrderId?: string;
};
export declare namespace OutputBufferListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    enum status {
        OPEN = "open",
        CLOSED = "closed"
    }
}
