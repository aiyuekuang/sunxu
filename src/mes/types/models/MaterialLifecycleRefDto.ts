/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MaterialLifecycleRefDto = {
    /**
     * 引用类别
     */
    category: MaterialLifecycleRefDto.category;
    /**
     * 引用编码
     */
    code: string;
    /**
     * 引用数量
     */
    count: number;
    /**
     * 引用名称
     */
    label: string;
};
export namespace MaterialLifecycleRefDto {
    /**
     * 引用类别
     */
    export enum category {
        MASTER = 'master',
        TRANSACTION = 'transaction',
        INVENTORY = 'inventory',
        QUALITY = 'quality',
        ANALYTICS = 'analytics',
    }
}
