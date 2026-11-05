/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type WorkOrderQuantityChangeStrategyDto = {
    /**
     * 是否允许生产中追加数量
     */
    allowAppend?: boolean;
    /**
     * 是否允许未开工前改投产数量
     */
    allowEdit?: boolean;
    /**
     * 是否允许完工后创建补加工单
     */
    allowSupplement?: boolean;
    /**
     * 工单数量动作超过生产计划投产数量时的处理方式
     */
    planOverrunMode?: WorkOrderQuantityChangeStrategyDto.planOverrunMode;
    /**
     * 允许超过生产计划投产数量的比例；0 表示不允许容差
     */
    planOverrunToleranceRatio?: number;
    /**
     * 超过生产计划时是否必须填写原因
     */
    requirePlanOverrunReason?: boolean;
    /**
     * 数量动作是否必须填写原因
     */
    requireReason?: boolean;
};
export namespace WorkOrderQuantityChangeStrategyDto {
    /**
     * 工单数量动作超过生产计划投产数量时的处理方式
     */
    export enum planOverrunMode {
        WARNING = 'warning',
        BLOCKING = 'blocking',
        APPROVAL = 'approval',
        AUTO_ADJUST_PLAN = 'auto_adjust_plan',
    }
}
