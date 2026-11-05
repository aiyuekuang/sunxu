/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto';
export type MaintenanceListDto = {
    /**
     * 负责人姓名/账号（模糊搜索）
     */
    assigneeName?: string;
    /**
     * 完成日期结束（YYYY-MM-DD）
     */
    completedEndDate?: string;
    /**
     * 完成日期开始（YYYY-MM-DD）
     */
    completedStartDate?: string;
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
     * 保养单号（模糊搜索）
     */
    maintenanceNo?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: MaintenanceListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 计划日期结束（YYYY-MM-DD）
     */
    planEndDate?: string;
    /**
     * 计划日期开始（YYYY-MM-DD）
     */
    planStartDate?: string;
    status?: MaintenanceListDto.status;
    /**
     * 保养类型（字典：maintenance_type）
     */
    type?: string;
};
export namespace MaintenanceListDto {
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
}
