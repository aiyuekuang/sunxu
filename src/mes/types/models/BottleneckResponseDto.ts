/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BottleneckItemDto } from './BottleneckItemDto';
export type BottleneckResponseDto = {
    bottlenecks: Array<BottleneckItemDto>;
    /**
     * 计划平均负荷率阈值
     */
    threshold: number;
};
