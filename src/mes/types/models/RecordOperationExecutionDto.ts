/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RecordOperationExecutionDto = {
    /**
     * 本次执行实测的准备/换型工时（分钟）；不传时不从 durationMinutes 反推
     */
    actualSetupMinutes?: number;
    /**
     * 本次执行有效工时（分钟）
     */
    durationMinutes?: number;
    /**
     * 执行结束时间
     */
    endedAt?: string;
    /**
     * 使用设备ID
     */
    equipmentId?: string;
    /**
     * 关联上下机会话ID
     */
    equipmentSessionId?: string;
    /**
     * 本次加工计数执行量。加工计数工序必填且必须大于 0；仅工时工序可不填。
     */
    executionQty?: number;
    /**
     * 执行原因
     */
    executionReason?: string;
    /**
     * 加工计数单位，如次、面、遍、点、件次；不传则使用工序快照单位
     */
    executionUnit?: string;
    /**
     * 业务实际发生时间，不传则默认当前时间
     */
    occurredAt?: string;
    /**
     * 非产出执行工序ID
     */
    operationId: string;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 实际执行人ID，不传则取工序指派人或当前用户
     */
    reporterId?: string;
    /**
     * 本次执行绑定的具体排产实例ID
     */
    scheduleEntryId?: string;
    /**
     * 执行开始时间
     */
    startedAt?: string;
    /**
     * 工时来源
     */
    timeSource?: RecordOperationExecutionDto.timeSource;
    /**
     * 工作中心ID
     */
    workCenterId?: string;
    /**
     * 工单ID
     */
    workOrderId: string;
};
export namespace RecordOperationExecutionDto {
    /**
     * 工时来源
     */
    export enum timeSource {
        MANUAL = 'manual',
        SESSION = 'session',
        IOT = 'iot',
        DERIVED = 'derived',
    }
}
