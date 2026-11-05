/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppliedSchedulePolicyDto } from './AppliedSchedulePolicyDto';
import type { ScheduleEntry } from './ScheduleEntry';
export type AutoScheduleResponseDto = {
    /**
     * 本次排产采用的缓冲策略
     */
    appliedPolicy: AppliedSchedulePolicyDto;
    /**
     * 创建的排产条目
     */
    entries: Array<ScheduleEntry>;
    /**
     * 排产条目总数
     */
    total: number;
};
