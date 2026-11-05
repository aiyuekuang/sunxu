import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ProductionSupplyListDto = {
    /**
     * 供料类型
     */
    bizType?: ProductionSupplyListDto.bizType;
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
    orderDir?: ProductionSupplyListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 状态
     */
    status?: ProductionSupplyListDto.status;
    /**
     * 单号
     */
    supplyNo?: string;
    /**
     * 工单ID
     */
    workOrderId?: string;
};
export declare namespace ProductionSupplyListDto {
    /**
     * 供料类型
     */
    enum bizType {
        REPLENISH = "replenish",
        RETURN = "return"
    }
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
        PARTIAL = "partial",
        COMPLETED = "completed",
        REVERSED = "reversed",
        CANCELLED = "cancelled"
    }
}
