/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CheckMaterialReadinessDto = {
    /**
     * 工序ID；scope=current_operation 时用于检查指定工序
     */
    operationId?: string;
    /**
     * 齐套检查范围；不传默认按整单 BOM 判断
     */
    scope?: CheckMaterialReadinessDto.scope;
    /**
     * 工单ID
     */
    workOrderId: string;
};
export namespace CheckMaterialReadinessDto {
    /**
     * 齐套检查范围；不传默认按整单 BOM 判断
     */
    export enum scope {
        FULL_BOM = 'full_bom',
        FIRST_OPERATION = 'first_operation',
        CURRENT_OPERATION = 'current_operation',
    }
}
