/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
import type { Warehouse } from './Warehouse';
import type { WarehouseLocationType } from './WarehouseLocationType';
export type WarehouseLocation = {
    allowStock: boolean;
    barcode?: string | null;
    code: string;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    depth: number;
    id: string;
    isActive: boolean;
    name: string;
    parent?: WarehouseLocation | null;
    parentId?: string | null;
    pathCode: string;
    pathName: string;
    remarks?: string | null;
    sortOrder: number;
    type: WarehouseLocationType;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    warehouse?: Warehouse;
    warehouseId: string;
};
