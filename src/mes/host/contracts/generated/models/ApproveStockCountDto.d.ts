export type ApproveStockCountDto = {
    /**
     * 盘点差异实际过账业务日期；不传时后端按当天处理，不允许未来日期
     */
    businessDate?: string;
    /**
     * ID
     */
    id: string;
    /**
     * 审核备注
     */
    remarks?: string;
};
