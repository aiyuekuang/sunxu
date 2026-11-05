import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ReportLogAdminDto = {
    /**
     * 生产批次号（模糊搜索）
     */
    batchNo?: string;
    /**
     * 结束日期 YYYY-MM-DD
     */
    endDate?: string;
    /**
     * 报工设备ID
     */
    equipmentId?: string;
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
     * 工序ID
     */
    operationId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: ReportLogAdminDto.orderDir;
    /**
     * 工单号（模糊搜索）
     */
    orderNo?: string;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 报工人ID
     */
    reportedBy?: string;
    /**
     * 开始日期 YYYY-MM-DD
     */
    startDate?: string;
    /**
     * 类型：report / revoke
     */
    type?: string;
    /**
     * 工单ID
     */
    workOrderId?: string;
};
export declare namespace ReportLogAdminDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
}
