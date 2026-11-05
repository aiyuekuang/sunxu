import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ScheduleListDto = {
    endDate?: string;
    /**
     * 排产条目ID
     */
    entryId?: string;
    equipmentId?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 关键词（计划号/工单号/物料名称/工序/工作中心/设备/执行人）
     */
    keyword?: string;
    operationId?: string;
    /**
     * 排序字段（plannedStart/plannedEnd/createdAt/status/orderNo/plannedQty/materialName/operationName/workCenterName/equipmentName）
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: ScheduleListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    planId?: string;
    startDate?: string;
    status?: ScheduleListDto.status;
    /**
     * 委外供应商ID
     */
    supplierId?: string;
    workCenterId?: string;
    workOrderId?: string;
};
export declare namespace ScheduleListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    enum status {
        SCHEDULED = "scheduled",
        CONFIRMED = "confirmed",
        IN_PROGRESS = "in_progress",
        COMPLETED = "completed",
        CANCELLED = "cancelled"
    }
}
