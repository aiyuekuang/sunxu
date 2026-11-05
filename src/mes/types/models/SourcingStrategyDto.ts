/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SourcingStrategyDto = {
    /**
     * 来源选项组未指定 selectionMode 时的默认选型策略
     */
    defaultPickStrategy?: SourcingStrategyDto.defaultPickStrategy;
    /**
     * 采购入库等级必填范围：none=不强制，all_receipt_lines=所有入库行必填
     */
    gradeRequiredScope?: SourcingStrategyDto.gradeRequiredScope;
    /**
     * 领料等级不匹配兜底严格度（BOM 来源选项组 strictMode 优先；默认 warning）
     */
    issueMismatchMode?: SourcingStrategyDto.issueMismatchMode;
    /**
     * 采购入库是否必须关联采购订单；无订单仅允许具备例外权限且填写原因后入库，默认关闭
     */
    requirePurchaseOrderOnReceipt?: boolean;
    /**
     * 工单关闭前是否要求成本结算完成（全局阻断，默认关闭）
     */
    requireSettledBeforeClose?: boolean;
    /**
     * 采购订单确认前是否必须指定等级（全局阻断，默认关闭）
     */
    requiredOnPurchaseOrder?: boolean;
    /**
     * [已废弃] 采购入库等级必填，已归一到 gradeRequiredScope；仅历史兼容保留，请改用 gradeRequiredScope
     * @deprecated
     */
    requiredOnReceipt?: boolean;
};
export namespace SourcingStrategyDto {
    /**
     * 来源选项组未指定 selectionMode 时的默认选型策略
     */
    export enum defaultPickStrategy {
        MANUAL_OR_PREFERRED = 'manual_or_preferred',
        MANUAL = 'manual',
        AUTO_PREFERRED = 'auto_preferred',
        COST_FIRST = 'cost_first',
        INVENTORY_FIRST = 'inventory_first',
    }
    /**
     * 采购入库等级必填范围：none=不强制，all_receipt_lines=所有入库行必填
     */
    export enum gradeRequiredScope {
        NONE = 'none',
        ALL_RECEIPT_LINES = 'all_receipt_lines',
    }
    /**
     * 领料等级不匹配兜底严格度（BOM 来源选项组 strictMode 优先；默认 warning）
     */
    export enum issueMismatchMode {
        WARNING = 'warning',
        BLOCKING = 'blocking',
    }
}
