/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ScheduleRuntimeStatus } from './ScheduleRuntimeStatus';
import type { ScheduleStatus } from './ScheduleStatus';
export type OperationScheduleSlotDto = {
    /**
     * 实例真实完工时间
     */
    actualEndAt?: string;
    /**
     * 实例真实开工时间
     */
    actualStartAt?: string;
    /**
     * 有效工时（分钟），已扣除排班休息时间
     */
    durationMinutes?: number;
    /**
     * 设备ID
     */
    equipmentId?: string;
    /**
     * 设备名称
     */
    equipmentName?: string;
    /**
     * 固定原因
     */
    firmReason?: string;
    id: string;
    /**
     * 是否为固定排产
     */
    isFirm: boolean;
    /**
     * 实例当前占用结束时间
     */
    occupiedEndAt?: string;
    /**
     * 实例当前占用开始时间
     */
    occupiedStartAt?: string;
    /**
     * 排产计划结束时间
     */
    plannedEnd: string;
    /**
     * 排产计划开始时间
     */
    plannedStart: string;
    /**
     * 计划版本号
     */
    planningVersion: number;
    /**
     * 是否需要重新确认
     */
    reconfirmRequired: boolean;
    /**
     * 实例运行态
     */
    runtimeStatus: ScheduleRuntimeStatus;
    /**
     * 该排产实例承担的计划数量
     */
    splitQty?: number;
    status: ScheduleStatus;
};
