/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProcessRouteMasterStatus } from './ProcessRouteMasterStatus';
import type { ProcessRouteType } from './ProcessRouteType';
import type { User } from './User';
export type ProcessRouteMaster = {
    /**
     * 稳定主编码，同一公司唯一
     */
    code: string;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 说明
     */
    description?: string | null;
    id: string;
    /**
     * 路线名称
     */
    name: string;
    /**
     * 路线类型
     */
    routeType: ProcessRouteType;
    /**
     * 主路线状态
     */
    status: ProcessRouteMasterStatus;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
