/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type DictType = {
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    id: string;
    isActive: boolean;
    /**
     * 是否系统内置（内置字典不允许删除类型，但可增删条目）
     */
    isSystem: boolean;
    remark?: string | null;
    /**
     * 字典类型编码，snake_case，如 material_unit
     */
    typeCode: string;
    /**
     * 字典类型名称，如"计量单位"
     */
    typeName: string;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
