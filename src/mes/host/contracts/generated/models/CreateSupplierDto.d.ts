export type CreateSupplierDto = {
    /**
     * 地址
     */
    address?: string;
    /**
     * 供应品类（字典：supplier_category）
     */
    category?: string;
    /**
     * 联系邮箱
     */
    contactEmail?: string;
    /**
     * 联系人
     */
    contactName?: string;
    /**
     * 联系电话
     */
    contactPhone?: string;
    /**
     * 交货周期（天）
     */
    leadTimeDays?: number;
    /**
     * 供应商名称
     */
    name: string;
    /**
     * 付款条件（字典：payment_terms）
     */
    paymentTerms?: string;
    /**
     * 负责采购员ID
     */
    purchasingRepId?: string;
    /**
     * 评级
     */
    rating?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 简称
     */
    shortName?: string;
    /**
     * 供应商编码
     */
    supplierCode?: string;
};
