import type { InternalIssueItemDto } from './InternalIssueItemDto.d.ts';
export type CreateInternalIssueDto = {
    /**
     * 部门ID
     */
    departmentId?: string;
    /**
     * 设备ID
     */
    equipmentId?: string;
    /**
     * 设备故障单ID
     */
    faultId?: string;
    /**
     * 内部领用类型
     */
    issueType?: CreateInternalIssueDto.issueType;
    /**
     * 领用明细
     */
    items: Array<InternalIssueItemDto>;
    /**
     * 设备保养单ID
     */
    maintenanceId?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 领用人ID；不传默认当前用户
     */
    requesterId?: string;
    /**
     * 工单ID；仅用于临时辅助领用归属
     */
    workOrderId?: string;
};
export declare namespace CreateInternalIssueDto {
    /**
     * 内部领用类型
     */
    enum issueType {
        MAINTENANCE = "maintenance",
        MAINTENANCE_PLAN = "maintenance_plan",
        DEPARTMENT = "department",
        TRIAL = "trial",
        PRODUCTION_EXTRA = "production_extra",
        OTHER = "other"
    }
}
