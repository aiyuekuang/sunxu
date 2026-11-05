export type CreateCalendarExceptionDto = {
    /**
     * 结束日期（YYYY-MM-DD，含当天；不传则等于开始日期）
     */
    endDate?: string;
    /**
     * 结束时间（HH:mm，仅 isAllDay=false 时有效）
     */
    endTime?: string;
    /**
     * 兼容字段：旧版单日日期（等同 startDate）
     * @deprecated
     */
    exceptionDate?: string;
    /**
     * 是否全天（默认 true）。false 时需传 startTime/endTime
     */
    isAllDay?: boolean;
    remarks?: string;
    /**
     * 班次日历ID
     */
    shiftCalendarId?: string | null;
    /**
     * 开始日期（YYYY-MM-DD）
     */
    startDate?: string;
    /**
     * 开始时间（HH:mm，仅 isAllDay=false 时有效）
     */
    startTime?: string;
    /**
     * 委外供应商ID
     */
    supplierId?: string | null;
    type: CreateCalendarExceptionDto.type;
    /**
     * 工作中心ID
     */
    workCenterId?: string | null;
};
export declare namespace CreateCalendarExceptionDto {
    enum type {
        HOLIDAY = "holiday",
        MAINTENANCE = "maintenance",
        OVERTIME = "overtime"
    }
}
