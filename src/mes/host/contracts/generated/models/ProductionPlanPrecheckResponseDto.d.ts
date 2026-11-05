/**
 * 生产计划下达前预检结果（只读，不阻断）
 */
export type ProductionPlanPrecheckResponseDto = {
    planId: string;
    /**
     * 硬问题（红色，建议先解决）
     */
    blockers: Array<string>;
    /**
     * 提示问题（橙色，可继续）
     */
    warnings: Array<string>;
    /**
     * 优化建议
     */
    suggestions: Array<string>;
    snapshot: Record<string, any>;
};
