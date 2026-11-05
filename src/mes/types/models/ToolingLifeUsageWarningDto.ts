/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ToolingLifeUsageWarningDto = {
    /**
     * 工装寿命计量单位
     */
    lifeCountUnit: string;
    /**
     * 需要现场处理的提示
     */
    message: string;
    /**
     * 本次工序报工单位；旧工单未配置时为空
     */
    reportCountUnit?: string | null;
    /**
     * 工装编号
     */
    toolingCode: string;
    /**
     * 工装ID
     */
    toolingId: string;
};
