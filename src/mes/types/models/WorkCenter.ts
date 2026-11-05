/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Department } from './Department';
import type { IssueMode } from './IssueMode';
import type { User } from './User';
import type { Warehouse } from './Warehouse';
export type WorkCenter = {
    capacityUnit?: string | null;
    children?: Array<WorkCenter>;
    code: string;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    department?: Department | null;
    departmentId?: string | null;
    description?: string | null;
    id: string;
    isActive: boolean;
    /**
     * 供料策略
     */
    issueMode: IssueMode;
    /**
     * 线边仓
     */
    lineSideWarehouse?: Warehouse | null;
    /**
     * 线边仓ID
     */
    lineSideWarehouseId?: string | null;
    maxConcurrency: number;
    name: string;
    parent?: WorkCenter | null;
    parentId?: string | null;
    /**
     * 显示排序，越小越靠前
     */
    sortOrder: number;
    type?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
