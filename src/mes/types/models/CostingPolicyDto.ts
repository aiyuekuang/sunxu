/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CostingPolicyDto = {
    /**
     * 成本核算口径
     */
    costBasis: CostingPolicyDto.costBasis;
    /**
     * 完工成本是否吸收标准人工（吸收成本法；默认 false 仅材料进库存）
     */
    includeLaborInProductCost: boolean;
    /**
     * 成本来源优先级
     */
    sourceOrder: Array<string>;
    /**
     * 缺成本严格度
     */
    strictness: CostingPolicyDto.strictness;
};
export namespace CostingPolicyDto {
    /**
     * 成本核算口径
     */
    export enum costBasis {
        STANDARD = 'standard',
        MOVING_AVERAGE = 'moving_average',
        LATEST_PURCHASE = 'latest_purchase',
    }
    /**
     * 缺成本严格度
     */
    export enum strictness {
        WARNING = 'warning',
        BLOCK = 'block',
    }
}
