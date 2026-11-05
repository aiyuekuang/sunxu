import type { DashboardAlertsDto } from './DashboardAlertsDto.d.ts';
import type { DashboardProductionDto } from './DashboardProductionDto.d.ts';
import type { DashboardQualityDto } from './DashboardQualityDto.d.ts';
import type { DashboardWorkOrdersDto } from './DashboardWorkOrdersDto.d.ts';
export type DashboardResponseDto = {
    alerts: DashboardAlertsDto;
    date: string;
    production: DashboardProductionDto;
    quality: DashboardQualityDto;
    workOrders: DashboardWorkOrdersDto;
};
