import type { ManualIssueItemDto } from './ManualIssueItemDto.d.ts';
export type ManualIssueDto = {
    /**
     * 实际手工领料出库业务日期；不传时后端按当天处理，不允许未来日期
     */
    businessDate?: string;
    /**
     * 领料明细
     */
    items: Array<ManualIssueItemDto>;
    /**
     * 工序ID
     */
    operationId?: string;
    /**
     * 领料人ID
     */
    operatorId?: string;
    /**
     * 计划发料日期（发料时间点）；手工指定时以该值落单，不传默认取工单计划开始时间（无排期则留空），允许未来日期
     */
    plannedIssueAt?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 工单ID
     */
    workOrderId: string;
};
