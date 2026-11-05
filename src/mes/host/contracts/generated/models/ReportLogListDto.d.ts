import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ReportLogListDto = {
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 工序ID（不传则返回工单所有报工流水）
     */
    operationId?: string;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 工单ID
     */
    workOrderId: string;
};
