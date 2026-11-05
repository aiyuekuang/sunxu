/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BatchAdjustResultItemDto } from './BatchAdjustResultItemDto';
export type BatchAdjustResponseDto = {
    results: Array<BatchAdjustResultItemDto>;
    /**
     * 成功数
     */
    succeeded: number;
    /**
     * 调整总数
     */
    total: number;
};
