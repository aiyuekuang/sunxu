export type UpdateTemporaryWorkerDto = {
    /**
     * 临时工ID
     */
    id: string;
    /**
     * 是否启用
     */
    isActive?: boolean;
    /**
     * 姓名
     */
    name?: string;
    /**
     * 手机号（公司内唯一）
     */
    phone?: string;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 实际合作截止日；当日仍可报工
     */
    validUntil?: string;
};
