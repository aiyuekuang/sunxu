import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type PackageUnitAvailableForDeliveryListDto = {
    /**
     * 批号
     */
    batchNo?: string;
    /**
     * 当前销售出库单ID，用于回显已占用箱
     */
    deliveryOrderId?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 物料档案ID
     */
    materialId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: PackageUnitAvailableForDeliveryListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 仓库ID
     */
    warehouseId?: string;
};
export declare namespace PackageUnitAvailableForDeliveryListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
}
