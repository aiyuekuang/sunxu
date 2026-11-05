/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PlanAchievementReleaseLineDto = {
    /**
     * 本批已完成良品
     */
    completedGoodQty: number;
    /**
     * 本批达成率（0-100）
     */
    completionRate: number;
    /**
     * 计划内批次行号
     */
    lineNo: number;
    /**
     * 本批投产数量
     */
    plannedQty: number;
    /**
     * 批次ID
     */
    releaseLineId: string;
    /**
     * 批次号
     */
    releaseNo: string;
    /**
     * 本批良品需求
     */
    requiredQty: number;
    /**
     * 批次状态
     */
    status: string;
    /**
     * 绑定工单ID
     */
    workOrderId?: string | null;
};
