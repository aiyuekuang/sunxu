/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CostingStrategyDto = {
    /**
     * 成本核算口径：standard(价目优先)/latest_purchase(最近采购优先)/moving_average(采购实际优先)
     */
    costBasis?: string;
    /**
     * 完工成本是否吸收标准人工（默认 false 仅材料进库存；true 时完工结算把工单工序标准人工计入产出成本）
     */
    includeLaborInProductCost?: boolean;
    /**
     * 成本来源优先级（显式覆盖口径推导）：price_tier/latest_purchase/material_unit_cost
     */
    sourceOrder?: Array<string>;
    /**
     * 缺成本严格度：warning(默认,不阻断)/block(严格模式阻断)
     */
    strictness?: string;
};
