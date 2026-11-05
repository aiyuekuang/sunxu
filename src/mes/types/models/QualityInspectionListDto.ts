/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto';
export type QualityInspectionListDto = {
    /**
     * 批次号（模糊搜索）
     */
    batchNo?: string;
    /**
     * 检验结论
     */
    conclusion?: QualityInspectionListDto.conclusion;
    /**
     * 客户ID（FQC/OQC）
     */
    customerId?: string;
    /**
     * 创建日期结束
     */
    endDate?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 检验单号（模糊搜索）
     */
    inspectionNo?: string;
    /**
     * 检验员ID
     */
    inspectorId?: string;
    /**
     * 是否自动创建（报工/完工触发）；不传不过滤
     */
    isAutoCreated?: boolean;
    /**
     * 搜索关键词
     */
    keyword?: string;
    materialId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: QualityInspectionListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 来源采购订单明细ID；用于从采购订单来料报检摘要下钻到关联IQC，不改变质检单归属
     */
    sourcePurchaseOrderItemId?: string;
    /**
     * 创建日期开始
     */
    startDate?: string;
    status?: QualityInspectionListDto.status;
    statuses?: Array<'pending' | 'submitted' | 'in_progress' | 'passed' | 'conditional' | 'rejected' | 'cancelled'>;
    /**
     * 提交日期结束
     */
    submittedEndDate?: string;
    /**
     * 提交日期开始
     */
    submittedStartDate?: string;
    /**
     * 供应商ID（IQC）
     */
    supplierId?: string;
    /**
     * 质检模板ID
     */
    templateId?: string;
    type?: QualityInspectionListDto.type;
    workOrderId?: string;
};
export namespace QualityInspectionListDto {
    /**
     * 检验结论
     */
    export enum conclusion {
        PENDING = 'pending',
        SUBMITTED = 'submitted',
        IN_PROGRESS = 'in_progress',
        PASSED = 'passed',
        CONDITIONAL = 'conditional',
        REJECTED = 'rejected',
        CANCELLED = 'cancelled',
    }
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
        PASSED = 'passed',
        CONDITIONAL = 'conditional',
        REJECTED = 'rejected',
        CANCELLED = 'cancelled',
    }
    export enum type {
        IQC = 'iqc',
        IPQC = 'ipqc',
        FQC = 'fqc',
        OQC = 'oqc',
    }
}
