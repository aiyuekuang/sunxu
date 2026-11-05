import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ProcessRouteVersionListDto = {
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: ProcessRouteVersionListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 工艺路线ID
     */
    routeId?: string;
    /**
     * 路线主数据ID
     */
    routeMasterId?: string;
    /**
     * 版本状态
     */
    status?: ProcessRouteVersionListDto.status;
};
export declare namespace ProcessRouteVersionListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * 版本状态
     */
    enum status {
        DRAFT = "draft",
        PENDING_REVIEW = "pending_review",
        APPROVED = "approved",
        SCHEDULED = "scheduled",
        ACTIVE = "active",
        SUPERSEDED = "superseded",
        OBSOLETE = "obsolete"
    }
}
