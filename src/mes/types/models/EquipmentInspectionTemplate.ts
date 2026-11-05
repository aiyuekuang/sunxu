/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type EquipmentInspectionTemplate = {
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
    /**
     * 点检项目列表
     */
    items: Array<{
        checkType?: string;
        id?: string;
        maxValue?: number | null;
        minValue?: number | null;
        name?: string;
        options?: Array<string>;
        photoRule?: string;
        required?: boolean;
        standard?: string;
        unit?: string | null;
    }>;
    name: string;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    /**
     * 模板版本号
     */
    version: number;
};
