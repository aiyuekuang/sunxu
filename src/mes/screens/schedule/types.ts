import type { ScheduleCapacityDto } from '../../host/api-types';

export interface ScheduleAnalysisQuery {
  startDate: ScheduleCapacityDto['startDate'];
  endDate: ScheduleCapacityDto['endDate'];
  workCenterId?: ScheduleCapacityDto['workCenterId'];
  workCenterType?: ScheduleCapacityDto['workCenterType'];
  /** 与甘特图当前显式状态筛选保持一致；未筛选时由后端排除已取消状态 */
  statusFilter?: ScheduleCapacityDto['statuses'];
}
