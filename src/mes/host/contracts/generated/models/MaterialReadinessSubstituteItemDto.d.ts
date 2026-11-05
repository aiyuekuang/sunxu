export type MaterialReadinessSubstituteItemDto = {
    /**
     * 替代料实际可用数量
     */
    availableQty: number;
    /**
     * 替代比例；替代料数量 / 原物料等价数量
     */
    conversionFactor: number;
    /**
     * 折算后的原物料等价可用数量
     */
    equivalentAvailableQty: number;
    /**
     * 替代物料编码
     */
    materialCode: string;
    /**
     * 替代物料档案ID
     */
    materialId: string;
    /**
     * 替代物料名称
     */
    materialName: string;
};
