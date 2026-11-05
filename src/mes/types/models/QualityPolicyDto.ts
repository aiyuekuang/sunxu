/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type QualityPolicyDto = {
    /**
     * 质检动作缺少可执行模板时的处理方式
     */
    templateMissingMode: QualityPolicyDto.templateMissingMode;
};
export namespace QualityPolicyDto {
    /**
     * 质检动作缺少可执行模板时的处理方式
     */
    export enum templateMissingMode {
        WARNING = 'warning',
        BLOCKING = 'blocking',
    }
}
