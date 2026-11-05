export type SaleOrderProductionPreparationTodoAssigneeDto = {
    /**
     * 负责人ID
     */
    assigneeId: string;
    /**
     * 负责人名称
     */
    assigneeName: string | null;
    /**
     * 逾期待办数
     */
    overdueCount: number;
    /**
     * 未完成待办数
     */
    unfinishedCount: number;
};
