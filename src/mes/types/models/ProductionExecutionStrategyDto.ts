/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ProductionExecutionStrategyDto = {
    /**
     * 工单下达缺入库仓处理方式
     */
    releaseReceiptWarehouseMode?: ProductionExecutionStrategyDto.releaseReceiptWarehouseMode;
    /**
     * 是否要求手工创建工单时填写计划开始时间；默认关闭，填写后仍由自动排程计算实际时段
     */
    requirePlanStartTimeOnManualCreate?: boolean;
};
export namespace ProductionExecutionStrategyDto {
    /**
     * 工单下达缺入库仓处理方式
     */
    export enum releaseReceiptWarehouseMode {
        WARNING = 'warning',
        BLOCKING = 'blocking',
    }
}
