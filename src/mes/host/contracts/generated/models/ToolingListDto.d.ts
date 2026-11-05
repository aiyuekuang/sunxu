import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
import type { ToolingLifeStatus } from './ToolingLifeStatus.d.ts';
export type ToolingListDto = {
    /**
     * 结束日期
     */
    endDate?: string;
    /**
     * 只查询临近到期（寿命达到预警阈值）的工装
     */
    expiring?: boolean;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 是否已上传图纸资料
     */
    hasDrawing?: boolean;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 寿命计量单位
     */
    lifeCountUnit?: string;
    /**
     * 寿命周期
     */
    lifeCycle?: number;
    lifeStatus?: ToolingLifeStatus;
    /**
     * 工装名称（模糊搜索）
     */
    name?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: ToolingListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 备注（模糊搜索）
     */
    remarks?: string;
    /**
     * 报废原因（模糊搜索）
     */
    scrapReason?: string;
    /**
     * 报废结束时间
     */
    scrappedEndDate?: string;
    /**
     * 报废开始时间
     */
    scrappedStartDate?: string;
    /**
     * 规格型号（模糊搜索）
     */
    spec?: string;
    /**
     * 开始日期
     */
    startDate?: string;
    status?: ToolingListDto.status;
    statuses?: Array<'available' | 'in_use' | 'maintenance' | 'scrapped'>;
    /**
     * 工装编号（模糊搜索）
     */
    toolingCode?: string;
    /**
     * 工装类型（字典：tooling_type）
     */
    type?: string;
    /**
     * 所属工作中心ID
     */
    workCenterId?: string;
};
export declare namespace ToolingListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    enum status {
        AVAILABLE = "available",
        IN_USE = "in_use",
        MAINTENANCE = "maintenance",
        SCRAPPED = "scrapped"
    }
}
