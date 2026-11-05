/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ScheduleGanttDto = {
    /**
     * 按客户筛选
     */
    customerId?: string;
    endDate: string;
    equipmentId?: string;
    groupBy?: ScheduleGanttDto.groupBy;
    /**
     * 关键词搜索（计划号/工单号/物料名称/客户名称）
     */
    keyword?: string;
    startDate: string;
    /**
     * 显式指定甘特图返回的排产状态；不传时默认排除已取消
     */
    statuses?: Array<'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>;
    workCenterId?: string;
    /**
     * 按工作中心类型筛选（对应 work_center_type 字典的 itemValue）
     */
    workCenterType?: string;
};
export namespace ScheduleGanttDto {
    export enum groupBy {
        WORK_CENTER = 'work_center',
        EQUIPMENT = 'equipment',
    }
}
