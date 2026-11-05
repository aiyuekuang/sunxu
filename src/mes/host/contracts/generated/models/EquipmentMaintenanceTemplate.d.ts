import type { User } from './User.d.ts';
export type EquipmentMaintenanceTemplate = {
    code: string;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    description?: string | null;
    /**
     * 适用设备类型
     */
    equipmentTypes: Array<string>;
    id: string;
    /**
     * 是否启用
     */
    isActive: boolean;
    name: string;
    /**
     * 保养步骤快照
     */
    steps: Array<{
        content?: string | null;
        id?: string;
        name?: string;
        photoRequired?: boolean | null;
        required?: boolean | null;
    }>;
    /**
     * 保养类型
     */
    type?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    /**
     * 模板版本号
     */
    version: number;
};
