export type BomItemSubstituteDto = {
    /**
     * 原物料缺料时是否自动使用该替代料
     */
    autoReplaceOnShortage?: boolean;
    /**
     * 替代比例
     */
    conversionFactor?: number;
    /**
     * 生效日期
     */
    effectiveFrom?: string;
    /**
     * 失效日期
     */
    effectiveTo?: string;
    /**
     * 是否启用
     */
    isActive?: boolean;
    /**
     * 推荐顺序
     */
    priority?: number;
    /**
     * 备注
     */
    remark?: string;
    /**
     * BOM 行批准替代物料ID
     */
    substituteMaterialId: string;
};
