export type MrpItemSourceDto = {
    /**
     * 按优先级和需求日期分配到该来源的可覆盖量
     */
    allocatedAvailableQty: number;
    /**
     * 建议生产物料在本次计算时冻结的 BOM 版本ID
     */
    bomHeaderId?: string | null;
    /**
     * BOM 用量计算快照摘要
     */
    calculationSnapshots?: Array<Record<string, any>>;
    /**
     * 需求来源ID
     */
    planId: string;
    /**
     * 需求来源物料名称
     */
    planMaterial: string;
    /**
     * 需求来源单号
     */
    planNo: string;
    /**
     * 需求日期
     */
    planStartDate: string;
    /**
     * 需求优先级，数字越大优先级越高
     */
    priority: number;
    /**
     * 该来源贡献的毛需求量
     */
    qty: number;
    /**
     * 该来源实际未覆盖缺口
     */
    shortageQty: number;
};
