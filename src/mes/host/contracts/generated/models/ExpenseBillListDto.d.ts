import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type ExpenseBillListDto = {
    /**
     * 费用场景
     */
    billScene?: ExpenseBillListDto.billScene;
    /**
     * 往来对象ID（按具体客户/供应商/员工精确筛选对账）
     */
    counterpartyId?: string;
    /**
     * 往来对象类型
     */
    counterpartyType?: ExpenseBillListDto.counterpartyType;
    /**
     * 结束业务日期 YYYY-MM-DD
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
    orderDir?: ExpenseBillListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 起始业务日期 YYYY-MM-DD
     */
    startDate?: string;
    /**
     * 状态
     */
    status?: ExpenseBillListDto.status;
};
export declare namespace ExpenseBillListDto {
    /**
     * 费用场景
     */
    enum billScene {
        REIMBURSEMENT = "reimbursement",
        DIRECT = "direct",
        MONTHLY = "monthly"
    }
    /**
     * 往来对象类型
     */
    enum counterpartyType {
        EMPLOYEE = "employee",
        SUPPLIER = "supplier",
        CUSTOMER = "customer",
        OTHER = "other"
    }
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * 状态
     */
    enum status {
        DRAFT = "draft",
        SUBMITTED = "submitted",
        APPROVED = "approved",
        PAID = "paid",
        CANCELLED = "cancelled"
    }
}
