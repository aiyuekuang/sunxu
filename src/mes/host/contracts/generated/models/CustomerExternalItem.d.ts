import type { BomItem } from './BomItem.d.ts';
import type { Customer } from './Customer.d.ts';
import type { CustomerExternalItemStatus } from './CustomerExternalItemStatus.d.ts';
import type { CustomerExternalItemUsageType } from './CustomerExternalItemUsageType.d.ts';
import type { Material } from './Material.d.ts';
import type { ProductionPlan } from './ProductionPlan.d.ts';
import type { SaleOrder } from './SaleOrder.d.ts';
import type { SaleOrderItem } from './SaleOrderItem.d.ts';
import type { Stock } from './Stock.d.ts';
import type { StockTransaction } from './StockTransaction.d.ts';
import type { User } from './User.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
import type { WorkOrder } from './WorkOrder.d.ts';
export type CustomerExternalItem = {
    /**
     * 附件URL
     */
    attachmentUrls: Array<string>;
    /**
     * 当前状态允许的业务操作
     */
    availableActions?: Array<string>;
    /**
     * 批号
     */
    batchNo?: string | null;
    bomItem?: BomItem | null;
    /**
     * BOM 行ID
     */
    bomItemId?: string | null;
    /**
     * 来源余额归零时的最终处置类型：return、loss、scrap
     */
    closeReason?: string | null;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    custodyWarehouse?: Warehouse | null;
    /**
     * 保管仓库ID
     */
    custodyWarehouseId?: string | null;
    customer?: Customer;
    /**
     * 客户ID
     */
    customerId: string;
    id: string;
    /**
     * 物品名称
     */
    itemName: string;
    /**
     * 规格/型号
     */
    itemSpec?: string | null;
    /**
     * 物品类型：耗材、标准件、工装、检具、包装物、临时用品等
     */
    itemType?: string | null;
    keeperUser?: User;
    /**
     * 保管责任人ID
     */
    keeperUserId: string;
    linkedMaterial?: Material | null;
    /**
     * 关联正式物料档案ID
     */
    linkedMaterialId?: string | null;
    linkedStock?: Stock | null;
    /**
     * 关联库存余额ID
     */
    linkedStockId?: string | null;
    linkedStockTransaction?: StockTransaction | null;
    /**
     * 关联库存流水ID
     */
    linkedStockTransactionId?: string | null;
    location?: WarehouseLocation | null;
    /**
     * 正式库存当前仓位ID
     */
    locationId?: string | null;
    /**
     * 照片URL
     */
    photoUrls: Array<string>;
    /**
     * 当前可退回/损耗数量；已转库存时按客户货主库存可用量和本登记数量取小值
     */
    processableQty?: number;
    productionPlan?: ProductionPlan | null;
    /**
     * 生产计划ID
     */
    productionPlanId?: string | null;
    /**
     * 项目号
     */
    projectCode?: string | null;
    /**
     * 数量
     */
    qty: number;
    /**
     * 到厂登记时间
     */
    receivedAt: string;
    /**
     * 登记单号
     */
    registerNo?: string | null;
    /**
     * 备注
     */
    remark?: string | null;
    /**
     * 归还/关闭时间
     */
    returnedAt?: string | null;
    saleOrder?: SaleOrder | null;
    /**
     * 销售订单ID
     */
    saleOrderId?: string | null;
    saleOrderItem?: SaleOrderItem | null;
    /**
     * 销售订单行ID
     */
    saleOrderItemId?: string | null;
    /**
     * 客户来料库存来源层ID
     */
    sourceLayerId?: string | null;
    /**
     * 按来源分摊计算的剩余数量
     */
    sourceRemainingQty?: number | null;
    /**
     * 登记状态
     */
    status: CustomerExternalItemStatus;
    /**
     * 是否已形成库存事实
     */
    stockManaged: boolean;
    /**
     * 具体存放位置文本
     */
    storageLocation?: string | null;
    /**
     * 单位
     */
    unit: string;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    /**
     * 用途类型：外来物品或生产用客户料
     */
    usageType: CustomerExternalItemUsageType;
    warehouse?: Warehouse | null;
    /**
     * 正式入库仓库ID
     */
    warehouseId?: string | null;
    workOrder?: WorkOrder | null;
    /**
     * 工单ID
     */
    workOrderId?: string | null;
};
