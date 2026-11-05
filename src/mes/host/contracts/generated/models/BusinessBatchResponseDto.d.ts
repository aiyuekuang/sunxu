import type { BusinessBatchResultItemDto } from './BusinessBatchResultItemDto.d.ts';
import type { BusinessBatchStatus } from './BusinessBatchStatus.d.ts';
export type BusinessBatchResponseDto = {
    /**
     * 服务端批次ID
     */
    batchId: string;
    /**
     * 失败数
     */
    failed: number;
    results: Array<BusinessBatchResultItemDto>;
    /**
     * 跳过数
     */
    skipped: number;
    /**
     * 批次执行状态
     */
    status: BusinessBatchStatus;
    /**
     * 成功数
     */
    succeeded: number;
    /**
     * 本次处理对象数（已去重）
     */
    total: number;
    /**
     * 批次级提示
     */
    warnings: Array<string>;
};
