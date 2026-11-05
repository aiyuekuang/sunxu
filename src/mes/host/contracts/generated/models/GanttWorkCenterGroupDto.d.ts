import type { GanttEntryDto } from './GanttEntryDto.d.ts';
export type GanttWorkCenterGroupDto = {
    entries: Array<GanttEntryDto>;
    /**
     * 该行对应的真实设备 ID；工作中心行或未分配行时为空
     */
    equipmentId?: string | null;
    hasChildren?: boolean;
    id: string;
    name: string;
    /**
     * 行类型：work_center=工作中心, equipment=设备, outsourcing=委外工序
     */
    type?: GanttWorkCenterGroupDto.type;
    /**
     * 该行对应的真实工作中心 ID；未分配行时为空
     */
    workCenterId?: string | null;
};
export declare namespace GanttWorkCenterGroupDto {
    /**
     * 行类型：work_center=工作中心, equipment=设备, outsourcing=委外工序
     */
    enum type {
        WORK_CENTER = "work_center",
        EQUIPMENT = "equipment",
        OUTSOURCING = "outsourcing"
    }
}
