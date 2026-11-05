/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LowStockMaterialDto = {
    code: string;
    id: string;
    /**
     * 兼容字段，返回本条库存预警实际使用的阈值
     */
    minStock?: number | null;
    name: string;
    safetyStock?: number | null;
    spec?: string | null;
    unit: string;
};
