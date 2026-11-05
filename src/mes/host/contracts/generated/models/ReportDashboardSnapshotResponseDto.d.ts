import type { AlertEventsResponseDto } from './AlertEventsResponseDto.d.ts';
import type { DashboardCockpitResponseDto } from './DashboardCockpitResponseDto.d.ts';
import type { DashboardComparisonDto } from './DashboardComparisonDto.d.ts';
import type { DashboardResponseDto } from './DashboardResponseDto.d.ts';
import type { LargeScreenResponseDto } from './LargeScreenResponseDto.d.ts';
import type { ProductionTrendItemDto } from './ProductionTrendItemDto.d.ts';
import type { QualitySummaryResponseDto } from './QualitySummaryResponseDto.d.ts';
import type { RealtimeDashboardResponseDto } from './RealtimeDashboardResponseDto.d.ts';
import type { ReportQueryContextResponseDto } from './ReportQueryContextResponseDto.d.ts';
import type { ReportSnapshotMetaDto } from './ReportSnapshotMetaDto.d.ts';
import type { WorkOrderSummaryResponseDto } from './WorkOrderSummaryResponseDto.d.ts';
export type ReportDashboardSnapshotResponseDto = {
    /**
     * 仅当前单日周期返回当前告警事件
     */
    alertEvents?: AlertEventsResponseDto | null;
    cockpit: DashboardCockpitResponseDto;
    comparison: DashboardComparisonDto;
    context: ReportQueryContextResponseDto;
    dashboard: DashboardResponseDto;
    /**
     * 仅当前单日周期返回大屏扩展数据
     */
    largeScreen?: LargeScreenResponseDto | null;
    meta: ReportSnapshotMetaDto;
    quality: QualitySummaryResponseDto;
    /**
     * 仅当前单日周期返回实时快照
     */
    realtime?: RealtimeDashboardResponseDto | null;
    /**
     * 当前库存预警数量；历史周期也明确标记为当前快照
     */
    stockWarningCount: number;
    trend: Array<ProductionTrendItemDto>;
    workOrderSummary: WorkOrderSummaryResponseDto;
};
