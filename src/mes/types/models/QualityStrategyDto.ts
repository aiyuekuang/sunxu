/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type QualityStrategyDto = {
    /**
     * 质检动作缺少可执行模板时的处理方式；warning 保留轻量质检兼容，blocking 要求先完成模板配置
     */
    templateMissingMode?: QualityStrategyDto.templateMissingMode;
};
export namespace QualityStrategyDto {
    /**
     * 质检动作缺少可执行模板时的处理方式；warning 保留轻量质检兼容，blocking 要求先完成模板配置
     */
    export enum templateMissingMode {
        WARNING = 'warning',
        BLOCKING = 'blocking',
    }
}
