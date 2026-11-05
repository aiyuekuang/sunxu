export type DashboardAlertsDto = {
    equipmentPendingCheck: number;
    lowStockCount: number;
    /**
     * 交期截止日已过的工单数
     */
    overdueWorkOrders: number;
    pendingInspections: number;
};
