import type { BatchAdjustItemDto } from './BatchAdjustItemDto.d.ts';
export type BatchAdjustDto = {
    /**
     * 批量库存差异调整行；不支持批号追踪物料，批号物料请使用 stock.adjust 并指定 batchNo
     */
    adjustments: Array<BatchAdjustItemDto>;
};
