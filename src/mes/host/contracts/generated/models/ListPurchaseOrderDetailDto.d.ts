import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ListPurchaseOrderDetailDto = {
    /**
     * 交货日期止（按明细交货日期，缺失时回退整单预计到货）
     */
    endDate?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 隐藏已收完且没有交货日期的采购明细；仅影响明细查询展示，不删除订单或收货记录
     */
    hideCompletedUndated?: boolean;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 物料档案ID
     */
    materialId?: string;
    /**
     * 仅显示可收采购明细（已确认/部分收货/已收货且仍有最大可收容量）
     */
    onlyInTransit?: boolean;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: ListPurchaseOrderDetailDto.orderDir;
    /**
     * 采购订单号（模糊搜索）
     */
    orderNo?: string;
    /**
     * 仅显示已逾期且仍未收完的采购明细
     */
    overdueOnly?: boolean;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 交货日期起（按明细交货日期，缺失时回退整单预计到货）
     */
    startDate?: string;
    /**
     * 采购订单状态（单选，向后兼容）；不传时默认排除已取消单据
     */
    status?: ListPurchaseOrderDetailDto.status;
    /**
     * 采购订单状态（多选）
     */
    statuses?: Array<'draft' | 'submitted' | 'confirmed' | 'partially_received' | 'received' | 'completed' | 'cancelled'>;
    /**
     * 供应商ID
     */
    supplierId?: string;
};
export declare namespace ListPurchaseOrderDetailDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * 采购订单状态（单选，向后兼容）；不传时默认排除已取消单据
     */
    enum status {
        DRAFT = "draft",
        SUBMITTED = "submitted",
        CONFIRMED = "confirmed",
        PARTIALLY_RECEIVED = "partially_received",
        RECEIVED = "received",
        COMPLETED = "completed",
        CANCELLED = "cancelled"
    }
}
