export type CreateInspectionGateReleaseDto = {
    equipmentId: string;
    /**
     * 兼容旧客户端的业务日期；服务端始终按当前设备班次推导
     */
    inspectionDate?: string;
    reason: string;
    workOrderId: string;
};
