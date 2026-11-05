import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type CustomerListDto = {
    /**
     * 客户编号（模糊搜索）
     */
    customerCode?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    /**
     * 所属行业
     */
    industry?: string;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 客户等级
     */
    level?: string;
    /**
     * 客户名称（模糊搜索）
     */
    name?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: CustomerListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    /**
     * 收款条件
     */
    paymentTerms?: string;
    /**
     * 负责销售员ID
     */
    salesRepId?: string;
    status?: CustomerListDto.status;
};
export declare namespace CustomerListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    enum status {
        ACTIVE = "active",
        INACTIVE = "inactive"
    }
}
