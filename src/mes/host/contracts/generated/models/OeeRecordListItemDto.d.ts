import type { Equipment } from './Equipment.d.ts';
import type { WorkCenter } from './WorkCenter.d.ts';
export type OeeRecordListItemDto = {
    actualOutput: number;
    actualRunTime: number;
    availability: number;
    companyId: string;
    createdAt: string;
    downtime: number;
    equipment?: Equipment;
    equipmentId: string;
    /**
     * 设备名称
     */
    equipmentName?: string | null;
    /**
     * 有效生产时间（分钟）=合格品数量按工序理论节拍折算的加工时间
     */
    fullyProductiveTime: number;
    /**
     * 良品数量
     */
    goodCount: number;
    goodOutput: number;
    id: string;
    /**
     * 净运行时间（分钟）=总产量按工序理论节拍折算的加工时间
     */
    netRunTime: number;
    oee: number;
    performance: number;
    plannedOutput: number;
    plannedTime: number;
    qualityRate: number;
    recordDate: string;
    shiftCalendarId?: string | null;
    /**
     * 实际总产出
     */
    totalCount: number;
    updatedAt: string;
    workCenter?: WorkCenter | null;
    workCenterId?: string | null;
};
