/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DeleteScheduleEntryResponseDto = {
    /**
     * 若移入已取消后联动取消工单，则返回被取消的工单号
     */
    cancelledWorkOrderNo?: string | null;
    success: boolean;
};
