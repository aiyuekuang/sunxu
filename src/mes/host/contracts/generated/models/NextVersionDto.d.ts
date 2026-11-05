import type { BomScope } from './BomScope.d.ts';
export type NextVersionDto = {
    /**
     * BOM 方案ID
     */
    bomMasterId?: string;
    /**
     * BOM 适用层级
     */
    bomScope?: BomScope;
    /**
     * 物料系列ID；系列基础 BOM 传此字段
     */
    familyId?: string;
    /**
     * 成品物料档案ID
     */
    materialId?: string;
};
