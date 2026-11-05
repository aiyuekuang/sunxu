import type { AppliedSchedulePolicyDto } from './AppliedSchedulePolicyDto.d.ts';
import type { PlanScheduleBomOutsourcingDto } from './PlanScheduleBomOutsourcingDto.d.ts';
export type PlanScheduleResultDto = {
    /**
     * 本次排产采用的缓冲策略
     */
    appliedPolicy: AppliedSchedulePolicyDto;
    /**
     * 本次排产后的 BOM 委外组件供料结果；显示有效委外单数量和单号，未生成时保留预计委外缺口
     */
    bomOutsourcing: Array<PlanScheduleBomOutsourcingDto>;
    /**
     * 创建的排产条目数量
     */
    entryCount: number;
    /**
     * 排产的生产计划数量
     */
    planCount: number;
    /**
     * 警告信息
     */
    warnings: Array<string>;
    /**
     * 创建的工单数量
     */
    workOrderCount: number;
};
