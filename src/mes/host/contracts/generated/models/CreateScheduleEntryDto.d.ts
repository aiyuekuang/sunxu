export type CreateScheduleEntryDto = {
    assigneeId?: string;
    equipmentId?: string;
    operationId?: string;
    plannedEnd: string;
    plannedStart: string;
    /**
     * 委外供应商ID
     */
    supplierId?: string | null;
    workCenterId?: string;
    workOrderId: string;
};
