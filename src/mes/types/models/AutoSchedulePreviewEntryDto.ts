/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AutoSchedulePreviewEntryDto = {
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
     * CPM 关键路径标记
     */
    isCritical?: boolean;
    /**
     * 是否委外工序；委外条目展示委外计划时长，不占用内部设备产能
     */
    isOutsourced?: boolean;
    operationId?: string | null;
    operationName?: string | null;
    plannedEnd: string;
    plannedStart: string;
    /**
     * 准备/换型工时（分钟）
     */
    setupMinutes?: number;
    /**
     * 准备/换型工时来源；无法可靠反推时为空
     */
    setupSource?: AutoSchedulePreviewEntryDto.setupSource | null;
    workCenterId?: string | null;
    workCenterName?: string | null;
    workOrderId: string;
    workOrderNo: string;
    /**
     * 工单计划交期
     */
    workOrderPlanEndTime?: string | null;
};
export namespace AutoSchedulePreviewEntryDto {
    /**
     * 准备/换型工时来源；无法可靠反推时为空
     */
    export enum setupSource {
        STANDARD = 'standard',
        ACTUAL = 'actual',
        DEFAULT = 'default',
        NONE = 'none',
    }
}
