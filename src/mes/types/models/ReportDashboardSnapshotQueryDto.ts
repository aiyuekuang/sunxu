/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ReportDashboardSnapshotQueryDto = {
    /**
     * 查询开始日期
     */
    dateFrom?: string;
    /**
     * 查询结束日期
     */
    dateTo?: string;
    /**
     * 产出物料ID
     */
    materialId?: string;
    /**
     * 仅显示交期已逾期的工单
     */
    overdueOnly?: boolean;
    /**
     * 查询周期
     */
    period?: ReportDashboardSnapshotQueryDto.period;
    /**
     * 工单状态
     */
    status?: ReportDashboardSnapshotQueryDto.status;
    /**
     * 工作中心ID
     */
    workCenterId?: string;
};
export namespace ReportDashboardSnapshotQueryDto {
    /**
     * 查询周期
     */
    export enum period {
        DAY = 'day',
        WEEK = 'week',
        MONTH = 'month',
        YEAR = 'year',
        CUSTOM = 'custom',
    }
    /**
     * 工单状态
     */
    export enum status {
        DRAFT = 'draft',
        SUBMITTED = 'submitted',
        RELEASED = 'released',
        IN_PROGRESS = 'in_progress',
        PAUSED = 'paused',
        COMPLETED = 'completed',
        CANCELLED = 'cancelled',
        CLOSED = 'closed',
    }
}
