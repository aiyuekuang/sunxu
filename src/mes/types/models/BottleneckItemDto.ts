/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BottleneckItemDto = {
    /**
     * 是否存在设备不可用风险
     */
    availabilityRisk: boolean;
    /**
     * 当前可用于排产的设备数（当前状态快照）
     */
    availableEquipmentCount: number;
    /**
     * 实际平均占用负荷率
     */
    avgOccupiedUtilization: number;
    /**
     * 计划平均负荷率
     */
    avgUtilization: number;
    /**
     * 设备可用数是否已压缩配置并发
     */
    capacityConstrainedByEquipment: boolean;
    /**
     * 工作中心配置的最大并发数
     */
    configuredConcurrency: number;
    /**
     * 计入设备可用性后的有效并发数
     */
    effectiveConcurrency: number;
    /**
     * 实际占用超载天数
     */
    occupiedOverloadDays: number;
    /**
     * 实际占用峰值日期
     */
    occupiedPeakDate: string;
    /**
     * 计划超载天数
     */
    overloadDays: number;
    /**
     * 计划峰值日期
     */
    peakDate: string;
    /**
     * 实际占用峰值负荷率
     */
    peakOccupiedUtilization: number;
    /**
     * 计划峰值负荷率
     */
    peakUtilization: number;
    /**
     * 是否存在无有效产能但仍有计划排产
     */
    scheduledWithoutCapacity: boolean;
    /**
     * 优化建议
     */
    suggestions: Array<string>;
    /**
     * 工作中心设备总数
     */
    totalEquipmentCount: number;
    /**
     * 总工作天数
     */
    totalWorkingDays: number;
    /**
     * 当前不可用于排产的设备数（当前状态快照）
     */
    unavailableEquipmentCount: number;
    workCenterId?: string | null;
    workCenterName?: string | null;
};
