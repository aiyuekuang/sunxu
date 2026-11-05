/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RouteTopologyDependencyDto = {
    /**
     * 依赖类型，本期只开放 finish_to_start
     */
    dependencyType?: RouteTopologyDependencyDto.dependencyType;
    /**
     * 最小良品门槛
     */
    minGoodQty?: number;
    /**
     * 前置工序ID
     */
    predecessorOperationId: string;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 展示排序
     */
    sort?: number;
    /**
     * 后续工序ID
     */
    successorOperationId: string;
    /**
     * 转移批量
     */
    transferBatchQty?: number;
};
export namespace RouteTopologyDependencyDto {
    /**
     * 依赖类型，本期只开放 finish_to_start
     */
    export enum dependencyType {
        FINISH_TO_START = 'finish_to_start',
    }
}
