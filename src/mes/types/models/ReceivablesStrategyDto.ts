/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ReceivablesStrategyDto = {
    /**
     * 账龄分段日界（3 个升序正整数，如 [30,60,90]）；未配置用通用默认 30/60/90。只读报表分段，不阻断业务。
     */
    agingBucketDays?: Array<number>;
};
