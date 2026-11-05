import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ListPurchaseOrderDto = {
    /**
     * 结束日期
     */
    endDate?: string;
    /**
     * 期望到货日期结束
     */
    expectedEndDate?: string;
    /**
     * 期望到货日期开始
     */
    expectedStartDate?: string;
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
    orderDir?: ListPurchaseOrderDto.orderDir;
    /**
     * 订单号（模糊搜索）
     */
    orderNo?: string;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 采购员姓名/账号（模糊搜索）
     */
    purchasingRepName?: string;
    /**
     * 仅返回可作为采购入库来源的订单（已确认/部分收货/已收货且至少一行仍有最大可收容量）
     */
    receivableOnly?: boolean;
    /**
     * 关联采购申请ID
     */
    requisitionId?: string;
    /**
     * 开始日期
     */
    startDate?: string;
    status?: ListPurchaseOrderDto.status;
    /**
     * 采购订单状态（可多选）
     */
    statuses?: Array<'draft' | 'submitted' | 'confirmed' | 'partially_received' | 'received' | 'completed' | 'cancelled'>;
    supplierId?: string;
};
export declare namespace ListPurchaseOrderDto {
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
        CONFIRMED = "confirmed",
        PARTIALLY_RECEIVED = "partially_received",
        RECEIVED = "received",
        COMPLETED = "completed",
        CANCELLED = "cancelled"
    }
}
