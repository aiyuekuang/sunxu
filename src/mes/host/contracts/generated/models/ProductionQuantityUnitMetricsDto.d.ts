export type ProductionQuantityUnitMetricsDto = {
    /**
     * 按单位分别计算的计划达成率
     */
    achievementRate: number | null;
    /**
     * 该单位下的已完成数量
     */
    completedQty: number;
    /**
     * 该单位下发生产出的工单数
     */
    count: number;
    /**
     * 图表展示名称
     */
    label: string;
    /**
     * 该单位下的计划数量
     */
    plannedQty: number;
    /**
     * 该单位下的数量
     */
    qty: number;
    /**
     * 按单位分别计算的报工不良率
     */
    reportDefectRate: number | null;
    /**
     * 按单位分别计算的报工良品率
     */
    reportGoodRate: number | null;
    /**
     * 该单位下的有效报工不良数量
     */
    reportedDefectQty: number;
    /**
     * 该单位下的有效报工良品数量
     */
    reportedGoodQty: number;
    /**
     * 稳定的图表分组键
     */
    seriesId: string;
    /**
     * 物料基础单位；临时制造项未配置时为 null
     */
    unit: string | null;
};
