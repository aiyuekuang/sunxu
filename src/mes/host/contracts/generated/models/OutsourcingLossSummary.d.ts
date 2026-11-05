export type OutsourcingLossSummary = {
    /**
     * 已检验数量
     */
    inspectedQty: number;
    /**
     * 委外发料明细行数
     */
    issueMaterialLineCount: number;
    /**
     * 存在投入未退余额的发料明细行数
     */
    openIssueMaterialLineCount: number;
    /**
     * 尚未关闭的待收数量；关闭或取消后为 0
     */
    openUnreceivedQty: number;
    /**
     * 待检验数量
     */
    pendingInspectionQty: number;
    /**
     * 待确认收货数量
     */
    pendingReceiptQty: number;
    /**
     * 委外计划产出数量
     */
    plannedOutputQty: number;
    /**
     * 合格数量
     */
    qualifiedQty: number;
    /**
     * 当前还可收货数量；受委外数量与投入料净发料材料平衡折算双重约束
     */
    receivableQty: number;
    /**
     * 已收货数量
     */
    receivedQty: number;
    /**
     * 投入料当前可退回合计数量（净发料扣除已收产出折算消耗，含待确认收货占用）
     */
    returnableIssueQty: number;
    /**
     * 累计不合格数量
     */
    unqualifiedQty: number;
    /**
     * 未收货差异数量
     */
    unreceivedQty: number;
};
