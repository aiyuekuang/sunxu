export type CreateTemporaryWorkerDto = {
    /**
     * 姓名
     */
    name: string;
    /**
     * 手机号（公司内唯一）
     */
    phone: string;
    /**
     * 备注
     */
    remark?: string;
    /**
     * 实际合作截止日；当日仍可报工
     */
    validUntil: string;
};
