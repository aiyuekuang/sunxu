export type AgingReportRowDto = {
    /**
     * 贷项抵减金额
     */
    creditOffset: number;
    /**
     * 当前账期金额
     */
    current: number;
    /**
     * 1-30天金额
     */
    days1to30: number;
    /**
     * 31-60天金额
     */
    days31to60: number;
    /**
     * 61-90天金额
     */
    days61to90: number;
    /**
     * 90天以上金额
     */
    over90: number;
    /**
     * 往来单位编码
     */
    partnerCode: string;
    /**
     * 往来单位ID
     */
    partnerId: string;
    /**
     * 往来单位名称
     */
    partnerName: string;
    /**
     * 合计余额
     */
    total: number;
};
