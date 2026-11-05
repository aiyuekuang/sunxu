import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type MaterialIssueListDto = {
    /**
     * 确认日期结束
     */
    confirmedEndDate?: string;
    /**
     * 确认日期开始
     */
    confirmedStartDate?: string;
    /**
     * 创建人姓名/账号（模糊搜索）
     */
    creatorName?: string;
    /**
     * 结束日期
     */
    endDate?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 领料单号
     */
    issueNo?: string;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 领料人姓名/账号（模糊搜索）
     */
    operatorName?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: MaterialIssueListDto.orderDir;
    /**
     * 工单号
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
     * 计划发料日期结束
     */
    plannedEndDate?: string;
    /**
     * 计划发料日期开始
     */
    plannedStartDate?: string;
    /**
     * 备注（模糊搜索）
     */
    remarks?: string;
    /**
     * 开始日期
     */
    startDate?: string;
    /**
     * 状态
     */
    status?: MaterialIssueListDto.status;
    /**
     * 状态（多选）
     */
    statuses?: Array<'draft' | 'submitted' | 'confirmed' | 'completed' | 'reversed' | 'cancelled'>;
    /**
     * 领料类型
     */
    type?: MaterialIssueListDto.type;
    /**
     * 领料类型（多选）
     */
    types?: Array<'auto_issue' | 'manual_issue' | 'return'>;
    /**
     * 工单ID
     */
    workOrderId?: string;
};
export declare namespace MaterialIssueListDto {
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
        CONFIRMED = "confirmed",
        COMPLETED = "completed",
        REVERSED = "reversed",
        CANCELLED = "cancelled"
    }
    /**
     * 领料类型
     */
    enum type {
        AUTO_ISSUE = "auto_issue",
        MANUAL_ISSUE = "manual_issue",
        RETURN = "return"
    }
}
