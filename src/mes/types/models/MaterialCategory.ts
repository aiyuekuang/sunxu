/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type MaterialCategory = {
    /**
     * 系统基础类型
     */
    baseType: MaterialCategory.baseType;
    children?: Array<MaterialCategory>;
    /**
     * 分类编码（建议 lower_snake_case）
     */
    code: string;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    id: string;
    /**
     * 是否启用
     */
    isActive: boolean;
    /**
     * 是否系统内置根分类
     */
    isSystem: boolean;
    /**
     * 分类名称
     */
    name: string;
    parent?: MaterialCategory | null;
    /**
     * 父级分类ID
     */
    parentId?: string | null;
    /**
     * 排序值
     */
    sort: number;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
export namespace MaterialCategory {
    /**
     * 系统基础类型
     */
    export enum baseType {
        RAW = 'raw',
        SEMI = 'semi',
        FINISHED = 'finished',
    }
}
