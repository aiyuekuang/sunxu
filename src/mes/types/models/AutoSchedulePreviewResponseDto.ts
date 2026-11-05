/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppliedSchedulePolicyDto } from './AppliedSchedulePolicyDto';
import type { AutoSchedulePreviewEntryDto } from './AutoSchedulePreviewEntryDto';
export type AutoSchedulePreviewResponseDto = {
    /**
     * 本次预览采用的缓冲策略
     */
    appliedPolicy: AppliedSchedulePolicyDto;
    /**
     * CPM 关键路径工序 ID 列表
     */
    criticalPath?: Array<string>;
    entries: Array<AutoSchedulePreviewEntryDto>;
    /**
     * 预览条目总数
     */
    total: number;
    /**
     * 警告信息
     */
    warnings: Array<string>;
};
