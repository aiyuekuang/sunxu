import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ListPurchaseReceiptDto = {
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
    orderDir?: ListPurchaseReceiptDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 关联采购订单ID
     */
    purchaseOrderId?: string;
    /**
     * 冲正日期结束
     */
    reversalEndDate?: string;
    /**
     * 冲正日期开始
     */
    reversalStartDate?: string;
    /**
     * 开始日期
     */
    startDate?: string;
    status?: ListPurchaseReceiptDto.status;
    /**
     * 采购入库单状态（可多选）
     */
    statuses?: Array<'draft' | 'submitted' | 'received' | 'reversed' | 'cancelled'>;
    /**
     * 供应商送货单号（模糊搜索）
     */
    supplierDeliveryNo?: string;
    supplierId?: string;
    /**
     * 实际入库仓库ID（按明细行筛选）
     */
    warehouseId?: string;
};
export declare namespace ListPurchaseReceiptDto {
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
        RECEIVED = "received",
        REVERSED = "reversed",
        CANCELLED = "cancelled"
    }
}
