/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OperationExecutionQuantityPolicyDto = {
    /**
     * 加工计数是否允许参与计件工资
     */
    allowPiecework: boolean;
    /**
     * 是否允许加工计数工序
     */
    enabled: boolean;
    /**
     * 最大执行量倍数；空表示不限制但保留超量原因
     */
    maxRatio?: number | null;
    /**
     * 执行数量超过计划目标时是否必须填写原因
     */
    requireReasonWhenExceedsPlan: boolean;
    /**
     * 工单进度中是否展示加工计数进度
     */
    visibleInWorkOrderProgress: boolean;
};
