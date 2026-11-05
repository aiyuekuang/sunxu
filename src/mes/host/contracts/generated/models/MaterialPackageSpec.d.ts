import type { Material } from './Material.d.ts';
import type { PackageType } from './PackageType.d.ts';
export type MaterialPackageSpec = {
    /**
     * 标准装箱数量
     */
    capacityQty: number;
    companyId: string;
    createdAt: string;
    id: string;
    /**
     * 是否启用
     */
    isActive: boolean;
    /**
     * 是否默认规格
     */
    isDefault: boolean;
    material?: Material;
    materialId: string;
    /**
     * 单箱最大数量
     */
    maxQty?: number | null;
    /**
     * 单箱最小数量
     */
    minQty?: number | null;
    /**
     * 包装名称，如标准箱、周转箱
     */
    packageName?: string | null;
    packageType: PackageType;
    remarks?: string | null;
    /**
     * 排序号
     */
    sortOrder: number;
    updatedAt: string;
};
