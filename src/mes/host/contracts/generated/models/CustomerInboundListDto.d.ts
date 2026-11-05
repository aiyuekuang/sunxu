import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type CustomerInboundListDto = {
    /**
     * BOM 行ID
     */
    bomItemId?: string;
    /**
     * 保管仓库ID
     */
    custodyWarehouseId?: string;
    /**
     * 客户ID
     */
    customerId?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 物品名称（模糊搜索）
     */
    itemName?: string;
    /**
     * 物品类型
     */
    itemType?: string;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 正式物料档案ID
     */
    linkedMaterialId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: CustomerInboundListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 生产计划ID
     */
    productionPlanId?: string;
    /**
     * 项目号
     */
    projectCode?: string;
    /**
     * 登记单号（模糊搜索）
     */
    registerNo?: string;
    /**
     * 销售订单ID
     */
    saleOrderId?: string;
    /**
     * 销售订单行ID
     */
    saleOrderItemId?: string;
    /**
     * 登记状态
     */
    status?: CustomerInboundListDto.status;
    /**
     * 具体存放位置（模糊搜索）
     */
    storageLocation?: string;
    /**
     * 用途类型
     */
    usageType?: CustomerInboundListDto.usageType;
    /**
     * 仓库ID
     */
    warehouseId?: string;
    /**
     * 工单ID
     */
    workOrderId?: string;
};
export declare namespace CustomerInboundListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * 登记状态
     */
    enum status {
        RECEIVED = "received",
        RETURNED = "returned",
        CONVERTED_TO_STOCK = "converted_to_stock",
        SCRAPPED = "scrapped",
        LOST = "lost",
        CLOSED = "closed"
    }
    /**
     * 用途类型
     */
    enum usageType {
        EXTERNAL_ITEM = "external_item",
        PRODUCTION_MATERIAL = "production_material"
    }
}
