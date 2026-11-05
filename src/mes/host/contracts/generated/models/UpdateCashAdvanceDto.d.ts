export type UpdateCashAdvanceDto = {
    /**
     * 借支金额（正数）
     */
    amount?: number;
    /**
     * 业务日期
     */
    bizDate?: string;
    /**
     * 借支对象ID（系统员工等主数据对象必填）
     */
    counterpartyId?: string;
    /**
     * 借支对象名称
     */
    counterpartyName?: string;
    /**
     * 借支对象类型（仅支持系统员工或其他人员）
     */
    counterpartyType?: UpdateCashAdvanceDto.counterpartyType;
    /**
     * 币种
     */
    currency?: string;
    /**
     * ID
     */
    id: string;
    /**
     * 借支事由
     */
    reason?: string;
    /**
     * 备注
     */
    remark?: string;
};
export declare namespace UpdateCashAdvanceDto {
    /**
     * 借支对象类型（仅支持系统员工或其他人员）
     */
    enum counterpartyType {
        EMPLOYEE = "employee",
        OTHER = "other"
    }
}
