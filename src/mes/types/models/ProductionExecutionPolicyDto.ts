/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ProductionExecutionPolicyDto = {
    /**
     * 工单下达缺入库仓处理方式
     */
    releaseReceiptWarehouseMode: ProductionExecutionPolicyDto.releaseReceiptWarehouseMode;
    /**
     * 手工创建工单时是否必须填写计划开始时间；默认 false，填写时间仍由自动排程计算实际时段
     */
    requirePlanStartTimeOnManualCreate: boolean;
};
export namespace ProductionExecutionPolicyDto {
    /**
     * 工单下达缺入库仓处理方式
     */
    export enum releaseReceiptWarehouseMode {
        WARNING = 'warning',
        BLOCKING = 'blocking',
    }
}
