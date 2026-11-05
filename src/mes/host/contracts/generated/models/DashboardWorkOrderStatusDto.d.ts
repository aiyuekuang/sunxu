import type { WorkOrderSummaryResponseDto } from './WorkOrderSummaryResponseDto.d.ts';
export type DashboardWorkOrderStatusDto = {
    scope: DashboardWorkOrderStatusDto.scope;
    summary: WorkOrderSummaryResponseDto;
};
export declare namespace DashboardWorkOrderStatusDto {
    enum scope {
        CURRENT_FLOW = "current_flow",
        PERIOD_CREATED = "period_created"
    }
}
