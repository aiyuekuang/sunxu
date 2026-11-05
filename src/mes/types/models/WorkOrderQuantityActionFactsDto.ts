/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type WorkOrderQuantityActionFactsDto = {
    /**
     * 已发生业务事实的最低数量底线
     */
    hardFactFloor: number;
    /**
     * 已发生完工入库数量
     */
    inboundQty: number;
    /**
     * 已发生质检抽样数量
     */
    inspectionQty: number;
    /**
     * 产出型工序已报工最大数量
     */
    outputOperationReportedQty: number;
    /**
     * 工单已产出数量（良品+报废）
     */
    workOrderOutputQty: number;
};
