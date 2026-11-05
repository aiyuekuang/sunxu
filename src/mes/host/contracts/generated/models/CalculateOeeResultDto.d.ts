export type CalculateOeeResultDto = {
    /**
     * 实际产量
     */
    actualOutput: number;
    /**
     * 实际运行工时（分钟）
     */
    actualRunTime: number;
    /**
     * 可用率
     */
    availability: number;
    /**
     * 停机时长（分钟）
     */
    downtime: number;
    /**
     * 结束日期（YYYY-MM-DD）
     */
    endDate: string;
    equipmentId: string;
    equipmentName: string;
    /**
     * 有效生产时间（分钟）=良品数×工序理论节拍
     */
    fullyProductiveTime: number;
    /**
     * 良品数量
     */
    goodOutput: number;
    /**
     * 净运行时间（分钟）=总产量×工序理论节拍
     */
    netRunTime: number;
    /**
     * OEE 综合效率
     */
    oee: number;
    /**
     * 性能率
     */
    performance: number;
    /**
     * 计划产量
     */
    plannedOutput: number;
    /**
     * 计划生产时间（分钟，已扣除计划休息和日历例外）
     */
    plannedTime: number;
    /**
     * 合格率
     */
    qualityRate: number;
    /**
     * 休息时长（分钟）
     */
    restTime: number;
    /**
     * 班次计划总时长（分钟，包含休息）
     */
    scheduledTime: number;
    /**
     * 开始日期（YYYY-MM-DD）
     */
    startDate: string;
};
