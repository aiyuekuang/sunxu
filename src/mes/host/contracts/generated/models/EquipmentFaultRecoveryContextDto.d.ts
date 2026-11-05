export type EquipmentFaultRecoveryContextDto = {
    /**
     * 故障设备ID
     */
    equipmentId: string;
    /**
     * 故障设备名称
     */
    equipmentName?: string | null;
    /**
     * 未解决停机故障ID
     */
    faultId: string;
    /**
     * 故障单号
     */
    faultNo: string;
};
