import type { CompleteMaterialIssueItemDto } from './CompleteMaterialIssueItemDto.d.ts';
export type CompleteMaterialIssueDto = {
    /**
     * 实际发料出库业务日期；不传时后端按当天处理，不允许未来日期
     */
    businessDate?: string;
    /**
     * ID
     */
    id: string;
    /**
     * 确认发料明细覆盖；批号物料可传批号
     */
    items?: Array<CompleteMaterialIssueItemDto>;
    /**
     * 计划发料日期（发料时间点）；确认发料时可补充或修正，传值则覆盖单据计划发料日期，不传保持不变
     */
    plannedIssueAt?: string;
};
