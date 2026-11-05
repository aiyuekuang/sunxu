/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type WorkOrderOperationPredecessorDependencyDto = {
    /**
     * 该依赖边的最小良品门槛
     */
    minGoodQty?: number | null;
    /**
     * 前置工序ID
     */
    predecessorOperationId: string;
    /**
     * 该依赖边的转移批量门槛
     */
    transferBatchQty?: number | null;
};
