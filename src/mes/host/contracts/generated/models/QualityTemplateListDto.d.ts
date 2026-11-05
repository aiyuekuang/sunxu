import type { ExportColumnSelectionDto } from './ExportColumnSelectionDto.d.ts';
export type QualityTemplateListDto = {
    /**
     * 模板编码（模糊搜索）
     */
    code?: string;
    /**
     * 导出时当前表格的可见列及其顺序；仅能筛选服务端已声明的导出列
     */
    exportColumns?: Array<ExportColumnSelectionDto>;
    isActive?: boolean;
    /**
     * 搜索关键词
     */
    keyword?: string;
    /**
     * 模板名称（模糊搜索）
     */
    name?: string;
    /**
     * 排序字段
     */
    orderBy?: string;
    /**
     * 排序方向
     */
    orderDir?: QualityTemplateListDto.orderDir;
    /**
     * 页码
     */
    page?: number;
    /**
     * 每页数量
     */
    pageSize?: number;
    type?: QualityTemplateListDto.type;
};
export declare namespace QualityTemplateListDto {
    /**
     * 排序方向
     */
    enum orderDir {
        ASC = "ASC",
        DESC = "DESC"
    }
    enum type {
        IQC = "iqc",
        IPQC = "ipqc",
        FQC = "fqc",
        OQC = "oqc"
    }
}
