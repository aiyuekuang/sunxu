/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ToolingStrategyDto = {
    /**
     * 工装推荐模式
     */
    recommendationMode?: ToolingStrategyDto.recommendationMode;
    /**
     * 工装绑定门禁模式
     */
    toolingBindingMode?: ToolingStrategyDto.toolingBindingMode;
};
export namespace ToolingStrategyDto {
    /**
     * 工装推荐模式
     */
    export enum recommendationMode {
        DISABLED = 'disabled',
        AVAILABLE_ONLY = 'available_only',
        UNIQUE_PRESELECT = 'unique_preselect',
    }
    /**
     * 工装绑定门禁模式
     */
    export enum toolingBindingMode {
        OFF = 'off',
        WARN = 'warn',
        REQUIRED_BEFORE_START = 'required_before_start',
        REQUIRED_BEFORE_REPORT = 'required_before_report',
        STRICT = 'strict',
    }
}
