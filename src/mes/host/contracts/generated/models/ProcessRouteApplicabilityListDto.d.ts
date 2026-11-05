import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ProcessRouteApplicabilityListDto = {
    /**
     * 适用客户ID
     */
    customerId?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 适用物料系列ID
     */
    familyId?: string;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 适用物料档案ID
     */
    materialId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: ProcessRouteApplicabilityListDto.orderDir;
    /**
     * 订单类型
     */
    orderType?: string;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 适用项目号 / 模具号 / 客户项目号
     */
    projectCode?: string;
    /**
     * 工艺路线ID，用于反查路线主数据
     */
    routeId?: string;
    /**
     * 路线主数据ID
     */
    routeMasterId?: string;
    /**
     * 适用销售订单ID
     */
    saleOrderId?: string;
    /**
     * 适用销售订单行ID
     */
    saleOrderItemId?: string;
};
export declare namespace ProcessRouteApplicabilityListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
}
