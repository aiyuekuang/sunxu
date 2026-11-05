import type { DashboardComparisonMetricDto } from './DashboardComparisonMetricDto.d.ts';
export type DashboardComparisonDto = {
    completedWorkOrders: DashboardComparisonMetricDto;
    outputQty: DashboardComparisonMetricDto;
    qualityPassRate: DashboardComparisonMetricDto;
};
