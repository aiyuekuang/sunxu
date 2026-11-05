/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BomQuantityStrategyDto = {
    /**
     * BOM 多级展开树的用量展示口径；只影响该展开树展示，不改变工单、MRP、领料等真实需求计算
     */
    explosionQuantityMode?: BomQuantityStrategyDto.explosionQuantityMode;
    /**
     * BOM 激活时公式不可计算的处理方式
     */
    formulaCheckMode?: BomQuantityStrategyDto.formulaCheckMode;
};
export namespace BomQuantityStrategyDto {
    /**
     * BOM 多级展开树的用量展示口径；只影响该展开树展示，不改变工单、MRP、领料等真实需求计算
     */
    export enum explosionQuantityMode {
        CUMULATIVE = 'cumulative',
        DIRECT_FOR_SEMI_AND_FINISHED = 'direct_for_semi_and_finished',
    }
    /**
     * BOM 激活时公式不可计算的处理方式
     */
    export enum formulaCheckMode {
        WARNING = 'warning',
        BLOCKING = 'blocking',
    }
}
