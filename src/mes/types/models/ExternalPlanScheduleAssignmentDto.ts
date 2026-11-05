/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ExternalPlanScheduleAssignmentDto = {
    /**
     * 设备级工序选择的设备ID；工作中心级工序不传
     */
    equipmentId?: string;
    /**
     * 当前计划解析后的工艺路线工序ID；无启用工序的计划按整单排产时为空。该ID是工艺路线工序ID，不是尚未生成的工单工序ID。
     */
    operationId?: Record<string, any> | null;
    /**
     * 生产计划ID
     */
    planId: string;
    /**
     * 排产结束时间，ISO 8601 日期时间
     */
    plannedEnd: string;
    /**
     * 排产开始时间，ISO 8601 日期时间
     */
    plannedStart: string;
    /**
     * 工作中心级工序选择的工作中心ID；设备级工序可省略，系统按设备归属确定工作中心
     */
    workCenterId?: string;
};
