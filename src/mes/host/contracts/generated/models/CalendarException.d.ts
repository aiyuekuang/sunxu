import type { CalendarExceptionType } from './CalendarExceptionType.d.ts';
import type { ShiftCalendar } from './ShiftCalendar.d.ts';
import type { Supplier } from './Supplier.d.ts';
import type { User } from './User.d.ts';
import type { WorkCenter } from './WorkCenter.d.ts';
export type CalendarException = {
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 结束日期（YYYY-MM-DD，含当天）
     */
    endDate?: string | null;
    /**
     * 结束时间（HH:mm，仅 isAllDay=false 时有效）
     */
    endTime?: string | null;
    /**
     * 兼容字段：旧版单日例外日期，等于 startDate
     */
    exceptionDate?: string;
    id: string;
    /**
     * 是否全天例外（true=整天，false=按 startTime~endTime）
     */
    isAllDay?: boolean;
    remarks?: string | null;
    shiftCalendar?: ShiftCalendar | null;
    shiftCalendarId?: string | null;
    /**
     * 开始日期（YYYY-MM-DD）
     */
    startDate?: string | null;
    /**
     * 开始时间（HH:mm，仅 isAllDay=false 时有效）
     */
    startTime?: string | null;
    /**
     * 委外供应商
     */
    supplier?: Supplier | null;
    /**
     * 委外供应商ID；为空且工作中心也为空时表示公司默认例外
     */
    supplierId?: string | null;
    type: CalendarExceptionType;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    workCenter?: WorkCenter | null;
    workCenterId?: string | null;
};
