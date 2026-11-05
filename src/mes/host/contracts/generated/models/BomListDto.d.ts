import type { BomScope } from './BomScope.d.ts';
import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type BomListDto = {
    /**
     * BOM 方案ID
     */
    bomMasterId?: string;
    /**
     * BOM 适用层级
     */
    bomScope?: BomScope;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 物料系列ID
     */
    familyId?: string;
    /**
     * 导入会话ID
     */
    importSessionId?: string;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 成品物料档案编码（模糊搜索）
     */
    materialCode?: string;
    /**
     * 成品物料档案ID
     */
    materialId?: string;
    /**
     * 成品物料档案名称（模糊搜索）
     */
    materialName?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: BomListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * BOM 状态
     */
    status?: BomListDto.status;
    statuses?: Array<'draft' | 'active' | 'obsolete'>;
    /**
     * BOM 版本号（模糊搜索）
     */
    version?: string;
};
export declare namespace BomListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * BOM 状态
     */
    enum status {
        DRAFT = "draft",
        ACTIVE = "active",
        OBSOLETE = "obsolete"
    }
}
