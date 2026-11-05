export type TodoUnreadCountDto = {
    /**
     * 审批待办数
     */
    approval: number;
    /**
     * 按单据类型分组的任务/提醒待办数量，不包含审批待办
     */
    byActionEntityType: Record<string, number>;
    /**
     * 按单据类型分组的待办数量，key 为 entityType
     */
    byEntityType: Record<string, number>;
    /**
     * 提醒待办数
     */
    reminder: number;
    /**
     * 任务待办数
     */
    task: number;
    /**
     * 待办总数
     */
    total: number;
};
