import type { InspectionItemDto } from './InspectionItemDto.d.ts';
export type CreateInspectionDto = {
    equipmentId: string;
    /**
     * 兼容旧客户端；新流程以服务端业务日期为准
     */
    inspectionDate?: string;
    items: Array<InspectionItemDto>;
    remarks?: string;
    /**
     * 点检任务ID；有计划任务时必传
     */
    taskId?: string;
};
