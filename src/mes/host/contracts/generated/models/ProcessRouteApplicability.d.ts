import type { Customer } from './Customer.d.ts';
import type { Material } from './Material.d.ts';
import type { MaterialFamily } from './MaterialFamily.d.ts';
import type { ProcessRouteMaster } from './ProcessRouteMaster.d.ts';
import type { SaleOrder } from './SaleOrder.d.ts';
import type { SaleOrderItem } from './SaleOrderItem.d.ts';
export type ProcessRouteApplicability = {
    companyId: string;
    createdAt: string;
    customer?: Customer | null;
    /**
     * 适用客户ID
     */
    customerId?: string | null;
    /**
     * 规则生效时间
     */
    effectiveFrom?: string | null;
    /**
     * 规则失效时间
     */
    effectiveTo?: string | null;
    family?: MaterialFamily | null;
    /**
     * 适用物料系列ID
     */
    familyId?: string | null;
    id: string;
    /**
     * 是否默认规则
     */
    isDefault: boolean;
    material?: Material | null;
    /**
     * 适用物料档案ID
     */
    materialId?: string | null;
    /**
     * 订单类型
     */
    orderType?: string | null;
    /**
     * 匹配优先级，越小越优先
     */
    priority: number;
    /**
     * 适用项目号 / 模具号 / 客户项目号
     */
    projectCode?: string | null;
    routeMaster: ProcessRouteMaster;
    /**
     * 路线主数据ID
     */
    routeMasterId: string;
    saleOrder?: SaleOrder | null;
    /**
     * 适用销售订单ID
     */
    saleOrderId?: string | null;
    saleOrderItem?: SaleOrderItem | null;
    /**
     * 适用销售订单行ID
     */
    saleOrderItemId?: string | null;
    updatedAt: string;
};
