export type RevokeOperationExecutionDto = {
    /**
     * 非产出执行工序ID
     */
    operationId: string;
    /**
     * 作废原因
     */
    remark?: string;
    /**
     * 要作废的非产出执行记录ID
     */
    reportLogId: string;
    /**
     * 工单ID
     */
    workOrderId: string;
};
