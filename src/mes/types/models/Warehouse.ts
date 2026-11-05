/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
import type { WarehouseLocationControlMode } from './WarehouseLocationControlMode';
import type { WarehouseType } from './WarehouseType';
export type Warehouse = {
    allowNegative: boolean;
    code: string;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    id: string;
    isActive: boolean;
    location?: string | null;
    /**
     * 仓位管控模式：none=不启用，optional=可选，required=必须
     */
    locationControlMode: WarehouseLocationControlMode;
    manager?: User | null;
    managerId?: string | null;
    name: string;
    /**
     * 显示排序，越小越靠前
     */
    sortOrder: number;
    /**
     * 仓库类型（系统枚举）
     */
    type: WarehouseType;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
