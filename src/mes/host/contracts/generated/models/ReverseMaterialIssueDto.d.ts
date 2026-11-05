export type ReverseMaterialIssueDto = {
    /**
     * 冲正实际业务日期；不传按当天处理，不能晚于当天
     */
    businessDate?: string;
    /**
     * ID
     */
    id: string;
    /**
     * 冲正原因
     */
    reason: string;
};
