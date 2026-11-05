/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WarehouseType } from './WarehouseType';
export type UpdateWarehouseDto = {
    allowNegative?: boolean;
    id: string;
    location?: string;
    /**
     * 仓位管控模式；required 需先通过启用检查
     */
    locationControlMode?: UpdateWarehouseDto.locationControlMode;
    managerId?: string;
    name?: string;
    /**
     * 显示排序，越小越靠前
     */
    sortOrder?: number;
    /**
     * 仓库类型（系统枚举）
     */
    type?: WarehouseType;
};
export namespace UpdateWarehouseDto {
    /**
     * 仓位管控模式；required 需先通过启用检查
     */
    export enum locationControlMode {
        NONE = 'none',
        OPTIONAL = 'optional',
        REQUIRED = 'required',
    }
}
