import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ListSaleDeliveryDto = {
    /**
     * 客户ID
     */
    customerId?: string;
    /**
     * 销售出库单编号（模糊搜索）
     */
    deliveryNo?: string;
    /**
     * 出库结束日期
     */
    endDate?: string;
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
    orderDir?: ListSaleDeliveryDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    saleOrderId?: string;
    /**
     * 关联销售订单号（模糊搜索）
     */
    saleOrderNo?: string;
    /**
     * 出库开始日期
     */
    startDate?: string;
    status?: ListSaleDeliveryDto.status;
    statuses?: Array<'draft' | 'submitted' | 'delivered' | 'reversed' | 'cancelled'>;
    /**
     * 出库仓库ID
     */
    warehouseId?: string;
};
export declare namespace ListSaleDeliveryDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    enum status {
        DRAFT = "draft",
        SUBMITTED = "submitted",
        DELIVERED = "delivered",
        REVERSED = "reversed",
        CANCELLED = "cancelled"
    }
}
