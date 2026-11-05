/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto';
export type ProcessRouteListDto = {
    /**
     * 路线编号（模糊搜索）
     */
    code?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 物料系列ID
     */
    familyId?: string;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 适用物料档案ID
     */
    materialId?: string;
    /**
     * 路线名称（模糊搜索）
     */
    name?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: ProcessRouteListDto.orderDir;
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
    status?: ProcessRouteListDto.status;
    statuses?: Array<'draft' | 'active' | 'obsolete'>;
};
export namespace ProcessRouteListDto {
    /**
     * 排序方向
     */
    export enum orderDir {
        ASC = 'ASC',
        DESC = 'DESC',
    }
    /**
     * 状态
     */
    export enum status {
        DRAFT = 'draft',
        ACTIVE = 'active',
        OBSOLETE = 'obsolete',
    }
}
