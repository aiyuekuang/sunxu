export type UpdateSupplierDto = {
    /**
     * 地址
     */
    address?: string | null;
    /**
     * 供应品类（字典：supplier_category）
     */
    category?: string | null;
    /**
     * 联系邮箱
     */
    contactEmail?: string | null;
    /**
     * 联系人
     */
    contactName?: string | null;
    /**
     * 联系电话
     */
    contactPhone?: string | null;
    /**
     * 供应商ID
     */
    id: string;
    /**
     * 交货周期（天）
     */
    leadTimeDays?: number | null;
    /**
     * 供应商名称
     */
    name?: string;
    /**
     * 付款条件（字典：payment_terms）
     */
    paymentTerms?: string | null;
    /**
     * 负责采购员ID
     */
    purchasingRepId?: string;
    /**
     * 评级
     */
    rating?: string | null;
    /**
     * 备注
     */
    remarks?: string | null;
    /**
     * 简称
     */
    shortName?: string | null;
    /**
     * 状态
     */
    status?: UpdateSupplierDto.status;
};
export declare namespace UpdateSupplierDto {
    /**
     * 状态
     */
    enum status {
        ACTIVE = "active",
        INACTIVE = "inactive"
    }
}
