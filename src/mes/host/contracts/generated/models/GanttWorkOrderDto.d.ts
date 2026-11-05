import type { GanttCustomerDto } from './GanttCustomerDto.d.ts';
import type { GanttMaterialDto } from './GanttMaterialDto.d.ts';
import type { WorkOrderScheduleBufferSource } from './WorkOrderScheduleBufferSource.d.ts';
export type GanttWorkOrderDto = {
    /**
     * 多工序按瓶颈工序计算的可交付良品数量
     */
    bottleneckCompletedQty?: number;
    completedQty?: number;
    customer?: GanttCustomerDto | null;
    id: string;
    material?: GanttMaterialDto | null;
    orderNo: string;
    plannedQty?: number;
    /**
     * 排产尾部缓冲分钟数快照
     */
    scheduleBufferMinutes?: number | null;
    /**
     * 排产时采用的缓冲比例快照
     */
    scheduleBufferRatio?: number | null;
    /**
     * 排产缓冲来源快照
     */
    scheduleBufferSource?: WorkOrderScheduleBufferSource | null;
    scrappedQty?: number;
    status?: string;
    /**
     * 用于前端展示的工单状态键（含派生态，如待下达）
     */
    statusDisplay?: string | null;
};
