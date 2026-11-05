/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CustomerMaterialDispositionItemInputDto = {
    /**
     * 实际出库批号
     */
    batchNo?: string;
    /**
     * 当前客户料处置明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 客户料处置明细自定义字段值
     */
    customValues?: Record<string, any>;
    /**
     * 来源客户来料登记ID
     */
    customerInboundId?: string;
    /**
     * 实际出库仓位ID
     */
    locationId?: string;
    /**
     * 处置数量（库存数量精度为 4 位小数）
     */
    qty: number;
    /**
     * 库存来源层ID；传入时优先按指定来源层处置
     */
    sourceLayerId?: string;
    /**
     * 实际出库仓库ID；已转库存的客户料必填，未转库存的外来物品不传
     */
    warehouseId?: string;
};
