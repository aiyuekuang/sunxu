export type TodoListItemDto = {
    /**
     * 不可直接处理时的操作提示
     */
    actionHint: string | null;
    assigneeId: string;
    assigneeName: string | null;
    assignerName: string | null;
    attachments: Array<string>;
    /**
     * 是否允许在待办中心直接取消
     */
    canCancel: boolean;
    /**
     * 是否允许在待办中心直接完成
     */
    canComplete: boolean;
    /**
     * 是否允许在待办中心开始处理
     */
    canStart: boolean;
    collaboratorIds: Array<string>;
    /**
     * 工作内容
     */
    content: string;
    createdAt: string;
    documentNo: string | null;
    dueDate: string | null;
    entityId: string | null;
    entityType: string | null;
    finishedAt?: string | null;
    id: string;
    /**
     * 当前用户是否主负责人
     */
    isAssignee: boolean;
    /**
     * 当前用户是否协同人
     */
    isCollaborator: boolean;
    /**
     * 是否逾期
     */
    isOverdue: boolean;
    plannedEndAt?: string | null;
    plannedStartAt?: string | null;
    priority: TodoListItemDto.priority;
    result?: string | null;
    startedAt?: string | null;
    status: TodoListItemDto.status;
    title: string;
    type: TodoListItemDto.type;
};
export declare namespace TodoListItemDto {
    enum priority {
        HIGH = "high",
        MEDIUM = "medium",
        LOW = "low"
    }
    enum status {
        PENDING = "pending",
        IN_PROGRESS = "in_progress",
        DONE = "done",
        CANCELLED = "cancelled"
    }
    enum type {
        APPROVAL = "approval",
        TASK = "task",
        REMINDER = "reminder"
    }
}
