import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
import type { MaterialCustomFieldFilterDto } from './MaterialCustomFieldFilterDto.d.ts';
import type { MaterialType } from './MaterialType.d.ts';
export type MaterialListDto = {
    /**
     * 系统基础类型（raw/semi/finished）
     */
    baseType?: MaterialType;
    /**
     * 物料分类名称（兼容字段：历史 category）
     */
    category?: string;
    /**
     * 物料分类ID
     */
    categoryId?: string;
    /**
     * 物料档案编码（模糊搜索）
     */
    code?: string;
    /**
     * 自定义字段筛选（文本相等，多个为 AND）；需字段配置为 queryable
     */
    customFilters?: Array<MaterialCustomFieldFilterDto>;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 所属物料系列ID（MaterialFamily）
     */
    familyId?: string;
    /**
     * 是否启用批次追踪
     */
    hasBatchTracking?: boolean;
    /**
     * 是否启用
     */
    isActive?: boolean;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 物料档案名称（模糊搜索）
     */
    name?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: MaterialListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 采购类型：buy/make/both
     */
    procurementType?: string;
    /**
     * 规格型号（模糊搜索）
     */
    spec?: string;
    /**
     * 物料分类编码（兼容字段：历史 type）
     */
    type?: string;
    /**
     * 库存基础单位
     */
    unit?: string;
};
export declare namespace MaterialListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
}
