/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BusinessBatchItemStatus } from './BusinessBatchItemStatus';
export type BusinessBatchResultItemDto = {
    /**
     * 执行后状态
     */
    afterStatus?: string;
    /**
     * 执行前状态
     */
    beforeStatus?: string;
    /**
     * 业务单号
     */
    documentNo?: string;
    /**
     * 单项耗时（毫秒）
     */
    durationMs?: number;
    /**
     * 业务对象ID
     */
    id: string;
    /**
     * 用户可读结果说明
     */
    message: string;
    /**
     * 关联业务对象ID
     */
    relatedId?: string;
    /**
     * 关联运行批次ID
     */
    relatedRunId?: string;
    /**
     * 稳定结果码
     */
    resultCode: string;
    /**
     * 是否适合直接重试
     */
    retryable: boolean;
    /**
     * 逐单执行状态
     */
    status: BusinessBatchItemStatus;
    /**
     * 是否执行成功
     */
    success: boolean;
};
