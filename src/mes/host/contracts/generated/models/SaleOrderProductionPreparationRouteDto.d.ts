export type SaleOrderProductionPreparationRouteDto = {
    /**
     * 路线冲突的销售订单行数
     */
    conflictCount: number;
    /**
     * 已匹配路线的销售订单行数
     */
    matchedCount: number;
    /**
     * 缺路线的销售订单行数
     */
    missingCount: number;
};
