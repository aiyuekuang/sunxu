import type { PlanWorkOrderItemDto } from './PlanWorkOrderItemDto.d.ts';
export type GetPlanWorkOrdersResponseDto = {
    /**
     * 总数
     */
    total: number;
    /**
     * 工单列表
     */
    workOrders: Array<PlanWorkOrderItemDto>;
};
