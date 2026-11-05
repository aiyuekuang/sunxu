/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SetupTransitionRuleDto = {
    /**
     * 来源准备组编码；空值代表任意来源准备组
     */
    fromSetupGroupCode?: string;
    /**
     * 该转换实际需要的准备工时（分钟）
     */
    setupMinutes: number;
    /**
     * 目标准备组编码；空值代表任意目标准备组
     */
    toSetupGroupCode?: string;
    /**
     * 工作中心ID；空值代表所有工作中心
     */
    workCenterId?: string;
};
