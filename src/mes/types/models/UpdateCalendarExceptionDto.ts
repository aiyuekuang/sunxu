/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateCalendarExceptionDto = {
    /**
     * 结束日期（YYYY-MM-DD，含当天）
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
    id: string;
    /**
     * 是否全天。false 时需传 startTime/endTime
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
    type?: UpdateCalendarExceptionDto.type;
    /**
     * 工作中心ID
     */
    workCenterId?: string | null;
};
export namespace UpdateCalendarExceptionDto {
    export enum type {
        HOLIDAY = 'holiday',
        MAINTENANCE = 'maintenance',
        OVERTIME = 'overtime',
    }
}
