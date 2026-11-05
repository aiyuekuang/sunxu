export type CreateCustomerMaterialDto = {
    /**
     * 客户ID
     */
    customerId: string;
    /**
     * 客户料号
     */
    customerMaterialCode?: string;
    /**
     * 客户物料名称
     */
    customerMaterialName?: string;
    /**
     * 客户规格/型号描述
     */
    customerMaterialSpec?: string;
    /**
     * 客户来料余额预警线；仅用于该客户货主库存，留空或 0 表示不参与预警
     */
    customerStockAlertQty?: number | null;
    /**
     * 内部物料档案ID
     */
    materialId: string;
    /**
     * 备注
     */
    remarks?: string;
};
