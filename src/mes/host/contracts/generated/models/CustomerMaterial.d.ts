import type { Customer } from './Customer.d.ts';
import type { Material } from './Material.d.ts';
export type CustomerMaterial = {
    companyId: string;
    createdAt: string;
    customer: Customer;
    /**
     * 客户ID
     */
    customerId: string;
    /**
     * 客户料号
     */
    customerMaterialCode?: string | null;
    /**
     * 客户物料名称
     */
    customerMaterialName?: string | null;
    /**
     * 客户规格/型号描述
     */
    customerMaterialSpec?: string | null;
    /**
     * 客户来料余额预警线；仅用于该客户货主库存，留空或 0 表示不参与预警
     */
    customerStockAlertQty?: number | null;
    id: string;
    material: Material;
    /**
     * 内部物料档案ID
     */
    materialId: string;
    /**
     * 备注
     */
    remarks?: string | null;
    updatedAt: string;
};
