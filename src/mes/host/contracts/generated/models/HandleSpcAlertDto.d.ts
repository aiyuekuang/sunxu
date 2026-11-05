export type HandleSpcAlertDto = {
    /**
     * 负责人ID
     */
    assigneeId?: string;
    /**
     * 处理说明
     */
    handleResult: string;
    /**
     * ID
     */
    id: string;
    /**
     * 备注
     */
    remarks?: string;
};
