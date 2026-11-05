import type { ShiftBreakDto } from './ShiftBreakDto.d.ts';
export type UpdateShiftCalendarDto = {
    /**
     * 休息时段列表
     */
    breaks?: Array<ShiftBreakDto>;
    code?: string;
    /**
     * 是否跨天班次（如 20:00→08:00）
     */
    crossDay?: boolean;
    endTime?: string;
    id: string;
    isActive?: boolean;
    name?: string;
    shiftType?: string;
    startTime?: string;
    /**
     * 委外供应商ID
     */
    supplierId?: string | null;
    wageMultiplier?: number;
    /**
     * 工作中心ID
     */
    workCenterId?: string | null;
    workingDays?: Array<number>;
};
