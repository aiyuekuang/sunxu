import type { ProductionPlanAchievementDemandLineDto } from './ProductionPlanAchievementDemandLineDto.d.ts';
import type { ProductionPlanAchievementReleaseLineDto } from './ProductionPlanAchievementReleaseLineDto.d.ts';
/**
 * 计划达成率（计划级 / 来源需求行 / 批次三级）
 */
export type ProductionPlanAchievementDto = {
    /**
     * 计划级需求良品数量
     */
    requiredQty: number;
    /**
     * 计划级已完成良品数量
     */
    completedQty: number;
    /**
     * 计划级完成率（0-100）
     */
    completionRate: number;
    /**
     * 需求是否已满足
     */
    requirementFulfilled: boolean;
    demandLineCount: number;
    releaseLineCount: number;
    demandLines: Array<ProductionPlanAchievementDemandLineDto>;
    releaseLines: Array<ProductionPlanAchievementReleaseLineDto>;
};
