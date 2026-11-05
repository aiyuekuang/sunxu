/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SourcingGradeRequiredScope } from './SourcingGradeRequiredScope';
import type { SourcingIssueMismatchMode } from './SourcingIssueMismatchMode';
import type { SourcingPickStrategy } from './SourcingPickStrategy';
export type SourcingPolicyDto = {
    /**
     * 来源选项组未指定 selectionMode 时的默认选型策略
     */
    defaultPickStrategy: SourcingPickStrategy;
    /**
     * 采购入库等级必填范围：none=不强制，all_receipt_lines=所有入库行必填
     */
    gradeRequiredScope: SourcingGradeRequiredScope;
    /**
     * 领料等级不匹配兜底严格度（BOM 来源选项组 strictMode 优先）
     */
    issueMismatchMode: SourcingIssueMismatchMode;
    /**
     * 采购入库是否必须关联采购订单；无订单仅允许具备例外权限且填写原因后入库
     */
    requirePurchaseOrderOnReceipt: boolean;
    /**
     * 工单关闭前要求成本结算完成（全局阻断）
     */
    requireSettledBeforeClose: boolean;
    /**
     * 采购订单确认前必须指定等级（全局阻断）
     */
    requiredOnPurchaseOrder: boolean;
    /**
     * 采购入库确认前必须指定等级（全局阻断）
     */
    requiredOnReceipt: boolean;
};
