import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ListDictItemsDto = {
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    isActive?: boolean;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 按 typeCode 过滤（最常用：前端直接拿某类字典）
     */
    typeCode?: string;
};
