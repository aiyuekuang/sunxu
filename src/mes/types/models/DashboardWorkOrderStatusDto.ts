/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkOrderSummaryResponseDto } from './WorkOrderSummaryResponseDto';
export type DashboardWorkOrderStatusDto = {
    scope: DashboardWorkOrderStatusDto.scope;
    summary: WorkOrderSummaryResponseDto;
};
export namespace DashboardWorkOrderStatusDto {
    export enum scope {
        CURRENT_FLOW = 'current_flow',
        PERIOD_CREATED = 'period_created',
    }
}
