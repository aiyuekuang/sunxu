export type DashboardComparisonMetricDto = {
    /**
     * 当前查询期间的指标值；单位混合时为 null
     */
    current: number | null;
    /**
     * 环比变化；无可比基数时为 null
     */
    mom?: number | null;
    /**
     * 上一段等长期间的指标值；单位混合时为 null
     */
    previousPeriod: number | null;
    /**
     * 上年同一日期范围的指标值；单位混合时为 null
     */
    samePeriodLastYear: number | null;
    unit: DashboardComparisonMetricDto.unit;
    /**
     * 同比变化；无可比基数时为 null
     */
    yoy?: number | null;
};
export declare namespace DashboardComparisonMetricDto {
    enum unit {
        PERCENT = "percent",
        PERCENTAGE_POINT = "percentage_point"
    }
}
