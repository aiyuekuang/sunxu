/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlanAchievementDemandLineDto } from './PlanAchievementDemandLineDto';
import type { PlanAchievementReleaseLineDto } from './PlanAchievementReleaseLineDto';
export type PlanAchievementDto = {
    /**
     * 计划完成良品总量
     */
    completedQty: number;
    /**
     * 计划完成率（0-100）
     */
    completionRate: number;
    /**
     * 需求行数量
     */
    demandLineCount: number;
    /**
     * 需求行达成率
     */
    demandLines: Array<PlanAchievementDemandLineDto>;
    /**
     * 批次数量
     */
    releaseLineCount: number;
    /**
     * 批次达成率
     */
    releaseLines: Array<PlanAchievementReleaseLineDto>;
    /**
     * 计划需求良品总量
     */
    requiredQty: number;
    /**
     * 计划需求是否已满足
     */
    requirementFulfilled: boolean;
};
