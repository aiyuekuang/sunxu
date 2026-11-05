/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ResolvedMaterialSupplierPriceDto = {
    /**
     * 本次取价基准日期
     */
    asOfDate: string;
    /**
     * 价目币别
     */
    currency: string | null;
    /**
     * 本次取价等级；命中价目时为价目等级，未命中价目时保留请求等级
     */
    grade: string | null;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 该供应商对本物料的最小起订量（供应商物料关系 minOrderQty）；用于低于起订量提示，未维护为 null
     */
    minOrderQty: number | null;
    /**
     * 价目原始录入价是否含税
     */
    priceIncludesTax: boolean | null;
    /**
     * 命中价目行的计价单位（priceUnit）；供采购单位自动带出，未命中价目为 null
     */
    priceUnit: string | null;
    /**
     * 价格来源：price_tier=供应商价目，material_cost=物料标准/估算成本，none=无价格
     */
    sourceType: ResolvedMaterialSupplierPriceDto.sourceType;
    /**
     * 供应商ID
     */
    supplierId: string;
    /**
     * 命中的供应商价目行ID
     */
    supplierPriceTierId: string | null;
    /**
     * 价目税率（%）
     */
    taxRate: number | null;
    /**
     * 解析出的采购单价；null 表示没有可自动带出的价格
     */
    unitPrice: number | null;
};
export namespace ResolvedMaterialSupplierPriceDto {
    /**
     * 价格来源：price_tier=供应商价目，material_cost=物料标准/估算成本，none=无价格
     */
    export enum sourceType {
        PRICE_TIER = 'price_tier',
        MATERIAL_COST = 'material_cost',
        NONE = 'none',
    }
}
