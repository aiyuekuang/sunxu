import type { CapacityWorkCenterDto } from './CapacityWorkCenterDto.d.ts';
import type { WorkCenterProductivityItemDto } from './WorkCenterProductivityItemDto.d.ts';
export type DashboardWorkCenterOverviewDto = {
    capacity: Array<CapacityWorkCenterDto>;
    /**
     * 未来排产负荷开始日期
     */
    capacityDateFrom: string;
    /**
     * 未来排产负荷结束日期
     */
    capacityDateTo: string;
    execution: Array<WorkCenterProductivityItemDto>;
    /**
     * 工作中心执行统计开始日期
     */
    executionDateFrom: string;
    /**
     * 工作中心执行统计结束日期
     */
    executionDateTo: string;
};
