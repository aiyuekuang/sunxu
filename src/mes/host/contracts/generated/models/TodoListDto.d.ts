import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type TodoListDto = {
    /**
     * 关联单据ID（按具体单据查本单待办）
     */
    entityId?: string;
    /**
     * 关联单据类型
     */
    entityType?: string;
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
    orderDir?: TodoListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 待办状态
     */
    status?: TodoListDto.status;
    /**
     * 待办状态列表
     */
    statuses?: Array<'pending' | 'in_progress' | 'done' | 'cancelled'>;
    /**
     * 待办类型
     */
    type?: TodoListDto.type;
    /**
     * 待办类型列表
     */
    types?: Array<'approval' | 'task' | 'reminder'>;
};
export declare namespace TodoListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * 待办状态
     */
    enum status {
        PENDING = "pending",
        IN_PROGRESS = "in_progress",
        DONE = "done",
        CANCELLED = "cancelled"
    }
    /**
     * 待办类型
     */
    enum type {
        APPROVAL = "approval",
        TASK = "task",
        REMINDER = "reminder"
    }
}
