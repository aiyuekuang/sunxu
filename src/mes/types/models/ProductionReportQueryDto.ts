/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ProductionReportQueryDto = {
    dateFrom?: string;
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
     * 工单状态
     */
    status?: ProductionReportQueryDto.status;
    /**
     * 工作中心ID
     */
    workCenterId?: string;
};
export namespace ProductionReportQueryDto {
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
