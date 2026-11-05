import type { SaleOrderProductionPreparationTodoAssigneeDto } from './SaleOrderProductionPreparationTodoAssigneeDto.d.ts';
export type SaleOrderProductionPreparationTodoDto = {
    /**
     * 负责人摘要
     */
    assignees: Array<SaleOrderProductionPreparationTodoAssigneeDto>;
    /**
     * 待办放行策略，默认 warning，不阻断转生产
     */
    gatePolicy: string;
    /**
     * 逾期待办数
     */
    overdueCount: number;
    /**
     * 未完成待办数
     */
    unfinishedCount: number;
};
