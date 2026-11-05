export type ReportQueryContextResponseDto = {
    /**
     * 查询开始日期
     */
    dateFrom: string;
    /**
     * 查询结束日期
     */
    dateTo: string;
    /**
     * 本次查询实际使用的业务筛选条件
     */
    filters: Record<string, any>;
    period: ReportQueryContextResponseDto.period;
    /**
     * 报表编码
     */
    reportCode: string;
    /**
     * 业务时区
     */
    timezone: string;
};
export declare namespace ReportQueryContextResponseDto {
    enum period {
        DAY = "day",
        WEEK = "week",
        MONTH = "month",
        YEAR = "year",
        CUSTOM = "custom"
    }
}
