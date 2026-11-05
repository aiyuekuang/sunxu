/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InventoryOwnerType } from './InventoryOwnerType';
import type { Material } from './Material';
import type { User } from './User';
import type { Warehouse } from './Warehouse';
import type { WarehouseLocation } from './WarehouseLocation';
export type Stock = {
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
    materialId: string;
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
};
