import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type SpcAlertListDto = {
    /**
     * 异常单号（模糊搜索）
     */
    alertNo?: string;
    /**
     * 异常类型
     */
    alertType?: SpcAlertListDto.alertType;
    /**
     * 负责人ID
     */
    assigneeId?: string;
    /**
     * SPC特征名称
     */
    characteristicName?: string;
    /**
     * 结束日期
     */
    endDate?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * SPC异常ID
     */
    id?: string;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 物料档案ID
     */
    materialId?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: SpcAlertListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 严重程度
     */
    severity?: SpcAlertListDto.severity;
    /**
     * 开始日期
     */
    startDate?: string;
    /**
     * 异常状态
     */
    status?: SpcAlertListDto.status;
    /**
     * 异常状态列表
     */
    statuses?: Array<'open' | 'processing' | 'closed' | 'cancelled'>;
};
export declare namespace SpcAlertListDto {
    /**
     * 异常类型
     */
    enum alertType {
        OUT_OF_SPEC = "out_of_spec",
        OUT_OF_CONTROL = "out_of_control"
    }
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    /**
     * 严重程度
     */
    enum severity {
        LOW = "low",
        MEDIUM = "medium",
        HIGH = "high",
        CRITICAL = "critical"
    }
    /**
     * 异常状态
     */
    enum status {
        OPEN = "open",
        PROCESSING = "processing",
        CLOSED = "closed",
        CANCELLED = "cancelled"
    }
}
