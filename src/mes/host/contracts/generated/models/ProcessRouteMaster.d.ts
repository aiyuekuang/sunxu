import type { ProcessRouteMasterStatus } from './ProcessRouteMasterStatus.d.ts';
import type { ProcessRouteType } from './ProcessRouteType.d.ts';
import type { User } from './User.d.ts';
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
