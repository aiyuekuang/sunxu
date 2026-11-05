export type PlanSchedulePreviewEntryDto = {
    assigneeId?: string | null;
    /**
     * 工时（分钟）
     */
    durationMinutes: number;
    equipmentId?: string | null;
    equipmentName?: string | null;
    /**
     * 是否为缓冲条目（尾部安全缓冲时间）
     */
    isBuffer?: boolean;
    /**
     * 是否委外工序；委外条目展示委外计划时长，不占用内部设备产能
     */
    isOutsourced?: boolean;
    operationName?: string | null;
    planId: string;
    planNo: string;
    plannedEnd: string;
    plannedStart: string;
    /**
     * 正式加工开始时间（按班次有效工时推导）
     */
    productionStartTime?: string;
    /**
     * 加工工时（分钟）
     */
    runMinutes?: number;
    /**
     * 准备/换型工时（分钟）
     */
    setupMinutes?: number;
    /**
     * 准备/换型工时来源；历史条目无法可靠反推时为空
     */
    setupSource?: PlanSchedulePreviewEntryDto.setupSource | null;
    /**
     * 准备/资源占用开始时间
     */
    setupStartTime?: string;
    /**
     * 拆分组标识
     */
    splitGroup?: string | null;
    /**
     * 该排产条目承担的计划数量
     */
    splitQty?: number | null;
    /**
     * 工时拆分数据来源
     */
    timeBreakdownSource?: PlanSchedulePreviewEntryDto.timeBreakdownSource;
    workCenterId?: string | null;
    workCenterName?: string | null;
};
export declare namespace PlanSchedulePreviewEntryDto {
    /**
     * 准备/换型工时来源；历史条目无法可靠反推时为空
     */
    enum setupSource {
        STANDARD = "standard",
        ACTUAL = "actual",
        DEFAULT = "default",
        NONE = "none"
    }
    /**
     * 工时拆分数据来源
     */
    enum timeBreakdownSource {
        SCHEDULE_ENTRY_SNAPSHOT = "schedule_entry_snapshot",
        OPERATION_SNAPSHOT = "operation_snapshot",
        MANUAL_ENTRY = "manual_entry",
        BUFFER_ENTRY = "buffer_entry",
        UNKNOWN = "unknown"
    }
}
