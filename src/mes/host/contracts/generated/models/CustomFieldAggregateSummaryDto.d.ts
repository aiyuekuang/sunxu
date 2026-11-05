export type CustomFieldAggregateSummaryDto = {
    /**
     * 字段编码
     */
    fieldKey: string;
    /**
     * 字段名称
     */
    label: string;
    /**
     * 聚合方式
     */
    mode: CustomFieldAggregateSummaryDto.mode;
    /**
     * 聚合结果；数值聚合无有效值时为空，非空计数最小为 0
     */
    value?: number | null;
};
export declare namespace CustomFieldAggregateSummaryDto {
    /**
     * 聚合方式
     */
    enum mode {
        SUM = "sum",
        AVG = "avg",
        MIN = "min",
        MAX = "max",
        COUNT_NON_EMPTY = "count_non_empty"
    }
}
