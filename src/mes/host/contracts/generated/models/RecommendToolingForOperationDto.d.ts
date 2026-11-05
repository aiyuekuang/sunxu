export type RecommendToolingForOperationDto = {
    /**
     * 当前设备ID；不传则使用工序已绑定设备
     */
    equipmentId?: string;
    /**
     * 工单工序ID
     */
    workOrderOpId: string;
};
