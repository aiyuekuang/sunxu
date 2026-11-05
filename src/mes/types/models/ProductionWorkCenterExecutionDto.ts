/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkCenterProductivityItemDto } from './WorkCenterProductivityItemDto';
export type ProductionWorkCenterExecutionDto = {
    /**
     * 工作中心执行统计开始日期
     */
    dateFrom: string;
    /**
     * 工作中心执行统计结束日期
     */
    dateTo: string;
    /**
     * 按计划完工超时数优先、完成率升序排列的工作中心执行清单
     */
    items: Array<WorkCenterProductivityItemDto>;
};
