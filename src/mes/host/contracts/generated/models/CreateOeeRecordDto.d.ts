export type CreateOeeRecordDto = {
    actualOutput: number;
    /**
     * 兼容旧客户端字段，实际运行工时由服务端按计划、停机和休息时间推导
     */
    actualRunTime?: number;
    downtime: number;
    equipmentId: string;
    goodOutput: number;
    plannedOutput: number;
    /**
     * 计划生产时间（分钟，已扣除计划休息和日历例外）
     */
    plannedTime: number;
    recordDate: string;
    shiftCalendarId?: string;
    workCenterId?: string;
};
