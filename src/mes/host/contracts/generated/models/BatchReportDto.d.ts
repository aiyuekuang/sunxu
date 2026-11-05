import type { BatchReportItemDto } from './BatchReportItemDto.d.ts';
export type BatchReportDto = {
    /**
     * 报工项列表
     */
    items: Array<BatchReportItemDto>;
    /**
     * 工单ID
     */
    workOrderId: string;
};
