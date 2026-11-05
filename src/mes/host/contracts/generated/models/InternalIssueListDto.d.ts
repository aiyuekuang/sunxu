import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type InternalIssueListDto = {
    /**
     * 确认时间结束
     */
    confirmedEndDate?: string;
    /**
     * 确认时间开始
     */
    confirmedStartDate?: string;
    /**
     * 部门ID
     */
    departmentId?: string;
    /**
     * 结束日期
     */
    endDate?: string;
    /**
     * 设备ID
     */
    equipmentId?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 设备故障单ID
     */
    faultId?: string;
    /**
     * 内部领用单号
     */
    issueNo?: string;
    /**
     * 内部领用类型
     */
    issueType?: InternalIssueListDto.issueType;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 设备保养单ID
     */
    maintenanceId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: InternalIssueListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 领用人ID
     */
    requesterId?: string;
    /**
     * 开始日期
     */
    startDate?: string;
    /**
     * 状态
     */
    status?: InternalIssueListDto.status;
    /**
     * 状态（可多选）
     */
    statuses?: Array<'draft' | 'submitted' | 'approved' | 'completed' | 'cancelled'>;
    /**
     * 工单ID
     */
    workOrderId?: string;
};
export declare namespace InternalIssueListDto {
    /**
     * 内部领用类型
     */
    enum issueType {
        MAINTENANCE = "maintenance",
        MAINTENANCE_PLAN = "maintenance_plan",
        DEPARTMENT = "department",
        TRIAL = "trial",
        PRODUCTION_EXTRA = "production_extra",
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
        COMPLETED = "completed",
        CANCELLED = "cancelled"
    }
}
