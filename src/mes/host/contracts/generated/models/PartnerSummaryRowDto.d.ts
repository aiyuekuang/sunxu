export type PartnerSummaryRowDto = {
    /**
     * 往来余额
     */
    balance: number;
    /**
     * 贷项抵减金额
     */
    creditNoteAmount: number;
    /**
     * 最近单据日期
     */
    lastDocumentDate?: string | null;
    /**
     * 净往来余额
     */
    netBalance: number;
    /**
     * 待应用信用余额
     */
    openCreditAmount: number;
    /**
     * 逾期单据数
     */
    overdueCount: number;
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
     * 开单总额
     */
    totalInvoiced: number;
    /**
     * 已结金额
     */
    totalPaid: number;
};
