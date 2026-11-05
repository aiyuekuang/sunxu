import type { InventoryOwnerType } from './InventoryOwnerType.d.ts';
import type { Material } from './Material.d.ts';
import type { User } from './User.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
export type StockListItemDto = {
    /**
     * 当前库存分组的预警阈值
     */
    alertThreshold?: number;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    frozenQty: number;
    id: string;
    location?: WarehouseLocation | null;
    /**
     * 仓位ID；为空表示仓库级库存
     */
    locationId?: string | null;
    material?: Material;
    /**
     * 物料档案编码
     */
    materialCode?: string | null;
    materialId: string;
    /**
     * 物料档案名称
     */
    materialName?: string | null;
    /**
     * 物料安全库存
     */
    materialSafetyStock: number;
    /**
     * 物料档案单位
     */
    materialUnit?: string | null;
    /**
     * 客户货主名称
     */
    ownerName?: string | null;
    /**
     * 库存归属方 ID；公司自有库存默认等于 companyId
     */
    ownerRefId: string;
    /**
     * 库存归属方类型，默认 company=公司自有库存
     */
    ownerType: InventoryOwnerType;
    quantity: number;
    reservedQty: number;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    warehouse?: Warehouse;
    warehouseId: string;
    /**
     * 仓库名称
     */
    warehouseName?: string | null;
};
