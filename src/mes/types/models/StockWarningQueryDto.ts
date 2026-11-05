/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StockWarningQueryDto = {
    /**
     * 物料ID
     */
    materialId?: string;
    /**
     * 货主类型
     */
    ownerType?: StockWarningQueryDto.ownerType;
    /**
     * 仓库ID
     */
    warehouseId?: string;
};
export namespace StockWarningQueryDto {
    /**
     * 货主类型
     */
    export enum ownerType {
        COMPANY = 'company',
        CUSTOMER = 'customer',
        SUPPLIER = 'supplier',
    }
}
