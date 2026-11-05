export type WorkCenterProductivityItemDto = {
    completed: number;
    completionRate: number;
    /**
     * 计划完工时刻已超时的工单数
     */
    overdue: number;
    total: number;
    workCenterId: string;
    workCenterName: string;
    workCenterType?: string | null;
};
