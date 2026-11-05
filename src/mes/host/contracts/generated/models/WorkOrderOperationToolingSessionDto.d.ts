export type WorkOrderOperationToolingSessionDto = {
    /**
     * 设备名称
     */
    equipmentName?: string | null;
    /**
     * 工装上机会话ID
     */
    id: string;
    /**
     * 操作人姓名
     */
    operatorName?: string | null;
    /**
     * 上机时间
     */
    startedAt: string;
    /**
     * 工装编码
     */
    toolingCode?: string | null;
    /**
     * 工装ID
     */
    toolingId: string;
    /**
     * 工装名称
     */
    toolingName?: string | null;
};
