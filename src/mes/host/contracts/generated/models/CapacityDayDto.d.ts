export type CapacityDayDto = {
    /**
     * 当前可用于排产的设备数（当前状态快照）
     */
    availableEquipmentCount: number;
    /**
     * 工作中心配置的最大并发数
     */
    configuredConcurrency: number;
    /**
     * 日期 YYYY-MM-DD
     */
    date: string;
    /**
     * 计入设备可用性后的有效并发数
     */
    effectiveConcurrency: number;
    /**
     * 当日排产条目的实际资源占用窗口落在有效工作时段内的占用时长；没有实际占用快照时回退计划窗口。该指标不等同于报工记录的实际工时
     */
    occupiedMinutes: number;
    /**
     * 实际占用负荷率（occupiedMinutes / totalMinutes）；超过 1 表示实际占用超过产能；无产能但有占用时为 1。该指标反映排产条目的资源占用窗口，不等同于报工记录的实际工时，仅用于产能分析展示，不参与瓶颈识别
     */
    occupiedUtilizationRate: number;
    /**
     * 当日计划窗口落在有效工作时段内的计划工时
     */
    scheduledMinutes: number;
    /**
     * 工作中心设备总数
     */
    totalEquipmentCount: number;
    /**
     * 当日有效可用产能分钟数（有效工作时段 × 有效并发数）
     */
    totalMinutes: number;
    /**
     * 当前不可用于排产的设备数（当前状态快照）
     */
    unavailableEquipmentCount: number;
    /**
     * 计划负荷率（scheduledMinutes / totalMinutes）；超过 1 表示计划超负荷
     */
    utilizationRate: number;
};
