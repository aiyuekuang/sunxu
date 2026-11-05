/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SetupStartRestrictionDto = {
    /**
     * 是否启用该时间窗限制
     */
    enabled?: boolean;
    /**
     * 准备工时大于该分钟数时，限制在 startAfter 后启动
     */
    minSetupMinutes?: number;
    /**
     * 限制起始时刻（HH:mm），例如 17:00
     */
    startAfter?: string;
};
