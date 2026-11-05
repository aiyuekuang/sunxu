import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ListSaleOrderDto = {
    customerId?: string;
    /**
     * 客户名称（模糊搜索）
     */
    customerName?: string;
    /**
     * 交货日期结束
     */
    deliveryEndDate?: string;
    /**
     * 交货日期开始
     */
    deliveryStartDate?: string;
    /**
     * 结束日期
     */
    endDate?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 履约场景筛选
     */
    fulfillmentScenario?: ListSaleOrderDto.fulfillmentScenario;
    /**
     * 仅查询已完成全部退货的销售订单；按订单及完整退货事实派生，不改变销售订单生命周期状态
     */
    fullyReturnedOnly?: boolean;
    /**
     * 是否仅查询仍有可创建销售出库单数量的订单；按订单行剩余可发数量计算，已扣除草稿/审批中/已出库占用，退货不恢复原订单待发数量
     */
    hasPendingDelivery?: boolean;
    /**
     * 是否仅查询仍有未转生产需求的销售订单；用于MRP等需求来源选择器
     */
    hasRemainingProductionDemand?: boolean;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 制造模式：单值兼容字段。按多个非标类型过滤时请使用 manufactureModes
     */
    manufactureMode?: ListSaleOrderDto.manufactureMode;
    /**
     * 制造模式集合：订单含有任一指定制造模式的明细行即命中，用于标准/非标聚合筛选
     */
    manufactureModes?: Array<'standard' | 'make_to_order' | 'engineer_to_order' | 'project'>;
    /**
     * 销售成品物料档案ID
     */
    materialId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: ListSaleOrderDto.orderDir;
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
     * 关联报价单ID
     */
    quotationId?: string;
    /**
     * 销售员姓名/账号（模糊搜索）
     */
    salesRepName?: string;
    /**
     * 结算方式筛选
     */
    settlementMode?: ListSaleOrderDto.settlementMode;
    /**
     * 开始日期
     */
    startDate?: string;
    status?: ListSaleOrderDto.status;
    /**
     * 状态集合，用于同一业务入口一次查询多个可用状态
     */
    statuses?: Array<'draft' | 'submitted' | 'confirmed' | 'production_pending' | 'ready_to_start' | 'in_production' | 'partially_shipped' | 'shipped' | 'completed' | 'cancelled'>;
};
export declare namespace ListSaleOrderDto {
    /**
     * 履约场景筛选
     */
    enum fulfillmentScenario {
        NORMAL_SALE = "normal_sale",
        CUSTOMER_SAMPLE = "customer_sample"
    }
    /**
     * 制造模式：单值兼容字段。按多个非标类型过滤时请使用 manufactureModes
     */
    enum manufactureMode {
        STANDARD = "standard",
        MAKE_TO_ORDER = "make_to_order",
        ENGINEER_TO_ORDER = "engineer_to_order",
        PROJECT = "project"
    }
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * 结算方式筛选
     */
    enum settlementMode {
        CHARGED = "charged",
        FREE = "free"
    }
    enum status {
        DRAFT = "draft",
        SUBMITTED = "submitted",
        CONFIRMED = "confirmed",
        PRODUCTION_PENDING = "production_pending",
        READY_TO_START = "ready_to_start",
        IN_PRODUCTION = "in_production",
        PARTIALLY_SHIPPED = "partially_shipped",
        SHIPPED = "shipped",
        COMPLETED = "completed",
        CANCELLED = "cancelled"
    }
}
