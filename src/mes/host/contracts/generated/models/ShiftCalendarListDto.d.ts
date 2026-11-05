import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ShiftCalendarListDto = {
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 委外供应商ID
     */
    supplierId?: string;
    /**
     * 工作中心ID
     */
    workCenterId?: string;
};
