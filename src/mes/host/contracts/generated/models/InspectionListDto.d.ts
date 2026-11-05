import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type InspectionListDto = {
    conclusion?: InspectionListDto.conclusion;
    /**
     * 结束日期
     */
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
    /**
     * 故障单状态
     */
    faultStatus?: string;
    /**
     * 点检模板
     */
    inspectionTemplateId?: string;
    /**
     * 点检人
     */
    inspectorId?: string;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 班次
     */
    shiftCalendarId?: string;
    /**
     * 开始日期
     */
    startDate?: string;
};
export declare namespace InspectionListDto {
    enum conclusion {
        NORMAL = "normal",
        ABNORMAL = "abnormal"
    }
}
