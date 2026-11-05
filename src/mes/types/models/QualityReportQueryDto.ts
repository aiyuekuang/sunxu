/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type QualityReportQueryDto = {
    dateFrom?: string;
    dateTo?: string;
    /**
     * 检验物料ID
     */
    materialId?: string;
    /**
     * 缺陷严重度
     */
    severity?: QualityReportQueryDto.severity;
    /**
     * 检验状态
     */
    status?: QualityReportQueryDto.status;
    /**
     * 检验类型
     */
    type?: QualityReportQueryDto.type;
};
export namespace QualityReportQueryDto {
    /**
     * 缺陷严重度
     */
    export enum severity {
        MINOR = 'minor',
        MAJOR = 'major',
        CRITICAL = 'critical',
    }
    /**
     * 检验状态
     */
    export enum status {
        PENDING = 'pending',
        SUBMITTED = 'submitted',
        IN_PROGRESS = 'in_progress',
        PASSED = 'passed',
        CONDITIONAL = 'conditional',
        REJECTED = 'rejected',
        CANCELLED = 'cancelled',
    }
    /**
     * 检验类型
     */
    export enum type {
        IQC = 'iqc',
        IPQC = 'ipqc',
        FQC = 'fqc',
        OQC = 'oqc',
    }
}
