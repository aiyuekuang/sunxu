import type { ProcessRouteStatus } from './ProcessRouteStatus.d.ts';
import type { User } from './User.d.ts';
export type ProcessRoute = {
    /**
     * 适用规则关联的物料系列列表（列表查询派生字段）
     */
    applicableFamilies?: Array<Record<string, any>>;
    /**
     * 适用规则关联的物料档案列表（列表查询派生字段）
     */
    applicableMaterials?: Array<Record<string, any>>;
    code: string;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    description?: string | null;
    id: string;
    name: string;
    operations?: Record<string, any>;
    status: ProcessRouteStatus;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    version: string;
};
