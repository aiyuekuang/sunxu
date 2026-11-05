import type { AppliedSchedulePolicyDto } from './AppliedSchedulePolicyDto.d.ts';
import type { PlanScheduleBomOutsourcingDto } from './PlanScheduleBomOutsourcingDto.d.ts';
import type { PlanSchedulePreviewEntryDto } from './PlanSchedulePreviewEntryDto.d.ts';
export type PlanSchedulePreviewResponseDto = {
    /**
     * 本次预览采用的缓冲策略
     */
    appliedPolicy: AppliedSchedulePolicyDto;
    /**
     * 按 BOM 需求和可用库存计算的委外组件供料摘要，不属于工序排程条目
     */
    bomOutsourcing: Array<PlanScheduleBomOutsourcingDto>;
    entries: Array<PlanSchedulePreviewEntryDto>;
    /**
     * 预览条目总数
     */
    total: number;
    /**
     * 警告信息
     */
    warnings: Array<string>;
};
