/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto';
export type SupplierListDto = {
    /**
     * 供应品类
     */
    category?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 供应商名称（模糊搜索）
     */
    name?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: SupplierListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 付款条件
     */
    paymentTerms?: string;
    /**
     * 负责采购员ID
     */
    purchasingRepId?: string;
    /**
     * 评级
     */
    rating?: string;
    /**
     * 状态
     */
    status?: SupplierListDto.status;
    /**
     * 供应商编码（模糊搜索）
     */
    supplierCode?: string;
};
export namespace SupplierListDto {
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
        ACTIVE = 'active',
        INACTIVE = 'inactive',
    }
}
