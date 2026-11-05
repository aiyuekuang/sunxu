export type BatchHandleApprovalDto = {
    /**
     * 统一审批动作
     */
    action: BatchHandleApprovalDto.action;
    /**
     * 客户端批量请求幂等键；同一动作重试时必须保持不变
     */
    clientRequestId: string;
    /**
     * 统一审批意见
     */
    comment?: string;
    /**
     * 审批实体类型
     */
    entityType: string;
    /**
     * ID 列表
     */
    ids: Array<string>;
    /**
     * 高风险批量动作预检令牌
     */
    previewToken?: string;
    /**
     * 批量操作原因
     */
    reason?: string;
};
export declare namespace BatchHandleApprovalDto {
    /**
     * 统一审批动作
     */
    enum action {
        APPROVED = "approved",
        REJECTED = "rejected"
    }
}
