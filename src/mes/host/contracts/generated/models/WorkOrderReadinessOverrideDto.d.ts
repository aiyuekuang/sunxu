export type WorkOrderReadinessOverrideDto = {
    /**
     * 是否确认缺料放行开工
     */
    accepted: boolean;
    /**
     * 缺料放行原因
     */
    reason?: string;
};
