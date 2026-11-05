import type { FreeReportMatchScope } from './FreeReportMatchScope.d.ts';
import type { Material } from './Material.d.ts';
import type { User } from './User.d.ts';
export type FreeReportConfig = {
    /**
     * 找不到开放工单时是否自动创建
     */
    autoCreateOpenOrder: boolean;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 自动开放工单默认计划数量，用于沿用现有工单超计划校验
     */
    defaultPlannedQty: number;
    id: string;
    /**
     * 是否启用
     */
    isActive: boolean;
    /**
     * 开放工单匹配范围
     */
    matchScope: FreeReportMatchScope;
    material?: Material;
    /**
     * 允许快捷报工的产出物料ID
     */
    materialId: string;
    /**
     * 配置名称
     */
    name?: string | null;
    /**
     * 备注
     */
    remark?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
