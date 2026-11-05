import type { ShiftBreakDto } from './ShiftBreakDto.d.ts';
export type CreateShiftCalendarDto = {
    /**
     * 休息时段列表
     */
    breaks?: Array<ShiftBreakDto>;
    /**
     * 班次编码，不填则系统自动生成
     */
    code?: string;
    /**
     * 是否跨天班次（如 20:00→08:00）
     */
    crossDay?: boolean;
    endTime: string;
    isActive?: boolean;
    name: string;
    /**
     * 班次类型字典，如 day/night/mid/swing
     */
    shiftType?: string;
    startTime: string;
    /**
     * 委外供应商ID
     */
    supplierId?: string | null;
    /**
     * 计薪系数
     */
    wageMultiplier?: number;
    /**
     * 工作中心ID
     */
    workCenterId?: string | null;
    workingDays: Array<number>;
};
