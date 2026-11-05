import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type EquipmentInspectionTaskListDto = {
    endDate?: string;
    equipmentId?: string;
    /**
     * 设备类型
     */
    equipmentType?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    keyword?: string;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    shiftCalendarId?: string;
    stage?: EquipmentInspectionTaskListDto.stage;
    startDate?: string;
    status?: EquipmentInspectionTaskListDto.status;
};
export declare namespace EquipmentInspectionTaskListDto {
    enum stage {
        BEFORE_SHIFT = "before_shift",
        AFTER_SHIFT = "after_shift"
    }
    enum status {
        PENDING = "pending",
        COMPLETED = "completed",
        OVERDUE = "overdue",
        CANCELLED = "cancelled",
        SUSPENDED = "suspended",
        SKIPPED = "skipped"
    }
}
