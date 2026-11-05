import type { Supplier } from './Supplier.d.ts';
import type { User } from './User.d.ts';
import type { WorkCenter } from './WorkCenter.d.ts';
export type ShiftCalendar = {
    /**
     * 休息时段列表，如 [{"startTime":"12:00","endTime":"13:00"}]
     */
    breaks: Array<{
        endTime?: string;
        startTime?: string;
    }>;
    /**
     * 班次编码，公式和导入使用
     */
    code: string;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 是否跨天班次（如 20:00→08:00）
     */
    crossDay: boolean;
    endTime: string;
    id: string;
    isActive: boolean;
    name: string;
    /**
     * 班次类型字典，如 day/night/mid/swing
     */
    shiftType?: string | null;
    startTime: string;
    /**
     * 委外供应商
     */
    supplier?: Supplier | null;
    /**
     * 委外供应商ID；为空且工作中心也为空时表示公司默认日历
     */
    supplierId?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    /**
     * 计薪系数，默认 1.0
     */
    wageMultiplier: number;
    workCenter?: WorkCenter | null;
    workCenterId?: string | null;
    workingDays: Array<string>;
};
