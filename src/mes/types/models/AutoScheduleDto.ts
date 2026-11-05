/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AutoScheduleDto = {
    algorithm?: AutoScheduleDto.algorithm;
    /**
     * 缓冲比例：在排产总工时末尾追加缓冲时间，提高排程稳定性。0=不加缓冲，0.15=15%（默认），最大0.5=50%
     */
    bufferRatio?: number;
    /**
     * 排产粒度：固定为设备级
     */
    granularity?: AutoScheduleDto.granularity;
    workOrderIds: Array<string>;
};
export namespace AutoScheduleDto {
    export enum algorithm {
        GREEDY = 'greedy',
        CRITICAL_PATH = 'critical_path',
    }
    /**
     * 排产粒度：固定为设备级
     */
    export enum granularity {
        EQUIPMENT = 'equipment',
    }
}
