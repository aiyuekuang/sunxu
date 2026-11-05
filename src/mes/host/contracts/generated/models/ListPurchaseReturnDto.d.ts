import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
import type { PurchaseReturnStatus } from './PurchaseReturnStatus.d.ts';
export type ListPurchaseReturnDto = {
    /**
     * 创建时间止
     */
    createdAtEnd?: string;
    /**
     * 创建时间起
     */
    createdAtStart?: string;
    /**
     * 创建时间止（兼容字段）
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
    orderDir?: ListPurchaseReturnDto.orderDir;
    /**
     * 退库仓库ID
     */
    outboundWarehouseId?: string;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 退货日期止
     */
    returnDateEnd?: string;
    /**
     * 退货日期起
     */
    returnDateStart?: string;
    /**
     * 退货单号（模糊搜索）
     */
    returnNo?: string;
    /**
     * 退货类型
     */
    returnType?: ListPurchaseReturnDto.returnType;
    /**
     * 来源采购订单ID
     */
    sourcePurchaseOrderId?: string;
    /**
     * 来源采购入库单ID
     */
    sourceReceiptId?: string;
    /**
     * 创建时间起（兼容字段）
     */
    startDate?: string;
    /**
     * 退货状态
     */
    status?: ListPurchaseReturnDto.status;
    /**
     * 退货状态列表
     */
    statuses?: Array<PurchaseReturnStatus>;
    /**
     * 供应商ID
     */
    supplierId?: string;
};
export declare namespace ListPurchaseReturnDto {
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
        REFUND_ONLY = "refund_only"
    }
    /**
     * 退货状态
     */
    enum status {
        DRAFT = "draft",
        PENDING_OUTBOUND = "pending_outbound",
        OUTBOUND = "outbound",
        COMPLETED = "completed",
        CANCELLED = "cancelled",
        REVERSED = "reversed"
    }
}
