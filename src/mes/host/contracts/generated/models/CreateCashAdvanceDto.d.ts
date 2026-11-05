export type CreateCashAdvanceDto = {
    /**
     * 借支金额（正数）
     */
    amount: number;
    /**
     * 业务日期
     */
    bizDate: string;
    /**
     * 借支对象ID（系统员工等主数据对象必填）
     */
    counterpartyId?: string;
    /**
     * 借支对象名称
     */
    counterpartyName?: string;
    /**
     * 借支对象类型（默认员工；仅支持系统员工或其他人员）
     */
    counterpartyType?: CreateCashAdvanceDto.counterpartyType;
    /**
     * 币种（留空取公司本位币）
     */
    currency?: string;
    /**
     * 借支事由
     */
    reason?: string;
    /**
     * 备注
     */
    remark?: string;
};
export declare namespace CreateCashAdvanceDto {
    /**
     * 借支对象类型（默认员工；仅支持系统员工或其他人员）
     */
    enum counterpartyType {
        EMPLOYEE = "employee",
        OTHER = "other"
    }
}
