export type DashboardWorkOrdersDto = {
    inProgress: number;
    /**
     * 交期截止日已过的未结工单数
     */
    overdueCount: number;
    pending: number;
};
