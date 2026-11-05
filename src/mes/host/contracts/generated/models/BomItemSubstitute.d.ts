export type BomItemSubstitute = {
    /**
     * 原物料缺料时是否自动使用该替代料
     */
    autoReplaceOnShortage: boolean;
    bomHeader?: Record<string, any>;
    /**
     * BOM 头ID
     */
    bomHeaderId: string;
    bomItem?: Record<string, any>;
    /**
     * BOM 行ID
     */
    bomItemId: string;
    companyId: string;
    /**
     * 替代比例
     */
    conversionFactor: number;
    createdAt: string;
    /**
     * 生效日期
     */
    effectiveFrom?: string | null;
    /**
     * 失效日期
     */
    effectiveTo?: string | null;
    id: string;
    /**
     * 是否启用
     */
    isActive: boolean;
    primaryMaterial?: Record<string, any>;
    /**
     * BOM 行原物料ID
     */
    primaryMaterialId: string;
    /**
     * 推荐顺序
     */
    priority: number;
    remark?: string | null;
    substituteMaterial?: Record<string, any>;
    /**
     * BOM 行批准替代物料ID
     */
    substituteMaterialId: string;
    updatedAt: string;
};
