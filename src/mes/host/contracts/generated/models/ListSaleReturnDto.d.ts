import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
import type { SaleReturnStatus } from './SaleReturnStatus.d.ts';
export type ListSaleReturnDto = {
    /**
     * 客户ID
     */
    customerId?: string;
    /**
     * 结束日期
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
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: ListSaleReturnDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 退货原因字典值（模糊搜索）
     */
    reasonCode?: string;
    /**
     * 收货日期结束
     */
    receiveEndDate?: string;
    /**
     * 收货日期开始
     */
    receiveStartDate?: string;
    /**
     * 退回仓库ID
     */
    receiveWarehouseId?: string;
    /**
     * 退货单号（模糊搜索）
     */
    returnNo?: string;
    /**
     * 退货类型
     */
    returnType?: ListSaleReturnDto.returnType;
    /**
     * 来源销售出库单ID
     */
    sourceDeliveryId?: string;
    /**
     * 来源销售订单ID
     */
    sourceSaleOrderId?: string;
    /**
     * 开始日期
     */
    startDate?: string;
    /**
     * 退货状态
     */
    status?: ListSaleReturnDto.status;
    /**
     * 退货状态列表
     */
    statuses?: Array<SaleReturnStatus>;
};
export declare namespace ListSaleReturnDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * 退货类型
     */
    enum returnType {
        PHYSICAL_RETURN = "physical_return",
        REFUND_ONLY = "refund_only",
        EXCHANGE_RETURN = "exchange_return"
    }
    /**
     * 退货状态
     */
    enum status {
        DRAFT = "draft",
        PENDING_APPROVAL = "pending_approval",
        PENDING_RECEIVE = "pending_receive",
        RECEIVED = "received",
        PENDING_INSPECTION = "pending_inspection",
        INSPECTED = "inspected",
        COMPLETED = "completed",
        CANCELLED = "cancelled",
        REVERSED = "reversed"
    }
}
