import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type WorkCenterListDto = {
    /**
     * 工作中心编码（模糊搜索）
     */
    code?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    isActive?: boolean;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 仅返回叶子节点（无子级的工作中心）
     */
    leafOnly?: boolean;
    /**
     * 工作中心名称（模糊搜索）
     */
    name?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: WorkCenterListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    parentId?: string;
    /**
     * 工作中心类型（字典：work_center_type）
     */
    type?: string;
};
export declare namespace WorkCenterListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
}
