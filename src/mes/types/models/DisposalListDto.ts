/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto';
export type DisposalListDto = {
    /**
     * 批号（模糊搜索）；经处置来源质检单过滤
     */
    batchNo?: string;
    /**
     * 创建人姓名/账号（模糊搜索）
     */
    creatorName?: string;
    /**
     * 处置单号（模糊搜索）
     */
    disposalNo?: string;
    /**
     * 结束日期
     */
    endDate?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    inspectionId?: string;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 物料档案ID；经处置来源质检单（单一 join）过滤
     */
    materialId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: DisposalListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 开始日期
     */
    startDate?: string;
    status?: DisposalListDto.status;
    statuses?: Array<'pending' | 'submitted' | 'in_progress' | 'completed' | 'cancelled'>;
    type?: DisposalListDto.type;
    workOrderId?: string;
};
export namespace DisposalListDto {
    /**
     * 排序方向
     */
    export enum orderDir {
        ASC = 'ASC',
        DESC = 'DESC',
    }
    export enum status {
        PENDING = 'pending',
        SUBMITTED = 'submitted',
        IN_PROGRESS = 'in_progress',
        COMPLETED = 'completed',
        CANCELLED = 'cancelled',
    }
    export enum type {
        REWORK = 'rework',
        SCRAP = 'scrap',
        CONCESSION = 'concession',
        SORT_ACCEPT = 'sort_accept',
        RETURN_TO_SUPPLIER = 'return_to_supplier',
    }
}
