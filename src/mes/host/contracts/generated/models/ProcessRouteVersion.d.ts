import type { ProcessRouteChangeType } from './ProcessRouteChangeType.d.ts';
import type { ProcessRouteVersionStatus } from './ProcessRouteVersionStatus.d.ts';
import type { User } from './User.d.ts';
export type ProcessRouteVersion = {
    /**
     * 启用时间
     */
    activatedAt?: string | null;
    /**
     * 启用人
     */
    activatedBy?: string | null;
    activator: User | null;
    /**
     * 批准时间
     */
    approvedAt?: string | null;
    /**
     * 批准人
     */
    approvedBy?: string | null;
    approver: User | null;
    /**
     * 变更原因
     */
    changeReason?: string | null;
    /**
     * 变更类型
     */
    changeType: ProcessRouteChangeType;
    companyId: string;
    /**
     * 版本内容指纹
     */
    contentHash?: string | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 生效时间
     */
    effectiveFrom?: string | null;
    /**
     * 失效时间
     */
    effectiveTo?: string | null;
    id: string;
    /**
     * 当前默认版本缓存标记
     */
    isCurrent: boolean;
    route: Record<string, any>;
    /**
     * 版本内容路线ID
     */
    routeId: string;
    routeMaster: Record<string, any>;
    /**
     * 路线主数据ID
     */
    routeMasterId: string;
    sourceVersion?: ProcessRouteVersion | null;
    /**
     * 来源版本ID
     */
    sourceVersionId?: string | null;
    /**
     * 版本状态
     */
    status: ProcessRouteVersionStatus;
    /**
     * 被替代时间
     */
    supersededAt?: string | null;
    /**
     * 替代操作人
     */
    supersededBy?: string | null;
    superseder: User | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    /**
     * 展示版本号
     */
    versionLabel: string;
    /**
     * 数字版本号
     */
    versionNo: number;
};
