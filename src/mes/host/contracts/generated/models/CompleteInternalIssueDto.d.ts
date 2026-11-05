export type CompleteInternalIssueDto = {
    /**
     * 实际领用出库业务日期；不传时后端按当天处理，不允许未来日期
     */
    businessDate?: string;
    /**
     * ID
     */
    id: string;
};
