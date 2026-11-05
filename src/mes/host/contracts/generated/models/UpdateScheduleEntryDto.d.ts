export type UpdateScheduleEntryDto = {
    assigneeId?: string;
    /**
     * 是否清空当前设备分配
     */
    clearEquipment?: boolean;
    equipmentId?: string;
    id: string;
    operationId?: string;
    plannedEnd?: string;
    plannedStart?: string;
    /**
     * 委外供应商ID
     */
    supplierId?: string | null;
    workCenterId?: string;
    workOrderId?: string;
};
