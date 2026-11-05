/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FinanceStrategyDto = {
    /**
     * 是否允许提交人本人审批自己的费用单/借支备用金。默认关闭，保持提交人与审批人分离；开启后仅当审批链把该用户配置为当前审批人时才可审批，无审批链的历史单据凭审批权限处理。
     */
    allowSubmitterApprove?: boolean;
    /**
     * 是否允许具备审批职责的用户在 App 处理费用单/借支审批
     */
    mobileApprovalEnabled?: boolean;
    /**
     * 是否允许在 App 执行付款、借出、归还核销和冲正
     */
    mobileExecutionEnabled?: boolean;
};
