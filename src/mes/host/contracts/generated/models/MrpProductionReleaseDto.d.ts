import type { MrpProductionReleaseItemDto } from './MrpProductionReleaseItemDto.d.ts';
export type MrpProductionReleaseDto = {
    /**
     * 客户端重试幂等键；同一键重复提交不会重复生成计划
     */
    idempotencyKey?: string;
    items: Array<MrpProductionReleaseItemDto>;
    /**
     * MRP运行ID
     */
    runId: string;
};
