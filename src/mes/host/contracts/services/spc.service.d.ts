import type { SpcCharacteristicQueryDto } from '../generated/models/SpcCharacteristicQueryDto.d.ts';
import type { ControlChartDto } from '../generated/models/ControlChartDto.d.ts';
import type { CpkDto } from '../generated/models/CpkDto.d.ts';
import type { CreateSpcRecordDto } from '../generated/models/CreateSpcRecordDto.d.ts';
import type { CancelSpcAlertDto } from '../generated/models/CancelSpcAlertDto.d.ts';
import type { CloseSpcAlertDto } from '../generated/models/CloseSpcAlertDto.d.ts';
import type { EscalateSpcAlertDto } from '../generated/models/EscalateSpcAlertDto.d.ts';
import type { HandleSpcAlertDto } from '../generated/models/HandleSpcAlertDto.d.ts';
import type { SpcAlertListDto } from '../generated/models/SpcAlertListDto.d.ts';
export type { SpcRecord } from '../generated/models/SpcRecord.d.ts';
export type { SpcAlert } from '../generated/models/SpcAlert.d.ts';
export type { SpcCharacteristicOptionDto as SpcCharacteristicOption } from '../generated/models/SpcCharacteristicOptionDto.d.ts';
export type { ControlChartResponseDto as ControlChartData } from '../generated/models/ControlChartResponseDto.d.ts';
export type { CpkResponseDto as CpkResult } from '../generated/models/CpkResponseDto.d.ts';
import type { SpcRecord } from '../generated/models/SpcRecord.d.ts';
import type { SpcAlert } from '../generated/models/SpcAlert.d.ts';
import type { SpcCharacteristicOptionDto as SpcCharacteristicOption } from '../generated/models/SpcCharacteristicOptionDto.d.ts';
import type { ControlChartResponseDto as ControlChartData } from '../generated/models/ControlChartResponseDto.d.ts';
import type { CpkResponseDto as CpkResult } from '../generated/models/CpkResponseDto.d.ts';
interface SpcRecordListParams {
    materialId: string;
    characteristicName: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}
export type SpcAlertStatus = 'open' | 'processing' | 'closed' | 'cancelled';
export type SpcAlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SpcAlertType = 'out_of_spec' | 'out_of_control';
export type SpcAlertListParams = Omit<SpcAlertListDto, 'alertType' | 'severity' | 'status'> & {
    alertType?: SpcAlertType;
    severity?: SpcAlertSeverity;
    status?: SpcAlertStatus;
};
export declare const spcService: {
    records: (params?: SpcRecordListParams) => Promise<import("./_base.d.ts").PaginatedList<SpcRecord>>;
    controlChart: (params: ControlChartDto) => Promise<ControlChartData>;
    cpk: (params: CpkDto) => Promise<CpkResult>;
    characteristics: (params: SpcCharacteristicQueryDto) => Promise<SpcCharacteristicOption[]>;
    create: (dto: CreateSpcRecordDto) => Promise<SpcRecord>;
    alerts: (params?: SpcAlertListParams) => Promise<import("./_base.d.ts").PaginatedList<SpcAlert>>;
    handleAlert: (dto: HandleSpcAlertDto) => Promise<SpcAlert>;
    closeAlert: (dto: CloseSpcAlertDto) => Promise<SpcAlert>;
    cancelAlert: (dto: CancelSpcAlertDto) => Promise<SpcAlert>;
    escalateAlert: (dto: EscalateSpcAlertDto) => Promise<SpcAlert>;
};
