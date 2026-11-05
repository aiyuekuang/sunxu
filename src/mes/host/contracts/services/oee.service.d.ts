import type { CreateOeeRecordDto } from '../generated/models/CreateOeeRecordDto.d.ts';
import type { OeeDashboardDto } from '../generated/models/OeeDashboardDto.d.ts';
import type { CalculateOeeDto } from '../generated/models/CalculateOeeDto.d.ts';
import type { CalculateOeeResultDto } from '../generated/models/CalculateOeeResultDto.d.ts';
import type { EquipmentOeeRecord } from '../generated/models/EquipmentOeeRecord.d.ts';
import type { OeeDashboardResponseDto } from '../generated/models/OeeDashboardResponseDto.d.ts';
export type { OeeRecordListItemDto as OeeRecord } from '../generated/models/OeeRecordListItemDto.d.ts';
export interface OeeDashboard {
    avgOee: number;
    avgAvailability: number;
    avgPerformance: number;
    avgQualityRate: number;
    byEquipment: Array<{
        equipmentId: string;
        equipmentName: string;
        avgOee: number;
        trend?: Array<{
            date: string;
            oee: number;
        }>;
    }>;
    trend: Array<{
        date: string;
        oee: number;
    }>;
}
import type { OeeRecordListItemDto as OeeRecord } from '../generated/models/OeeRecordListItemDto.d.ts';
interface OeeListParams {
    equipmentId?: string;
    workCenterId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}
export declare const oeeService: {
    create: (dto: CreateOeeRecordDto) => Promise<EquipmentOeeRecord>;
    dashboard: (params: OeeDashboardDto) => Promise<OeeDashboardResponseDto>;
    calculate: (dto: CalculateOeeDto) => Promise<CalculateOeeResultDto>;
    list(params?: OeeListParams): Promise<import("./_base.d.ts").PaginatedList<OeeRecord>>;
    detail(id: string): Promise<OeeRecord>;
};
