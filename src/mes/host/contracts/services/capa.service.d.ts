import type { CancelCapaDto } from '../generated/models/CancelCapaDto.d.ts';
import type { CreateCapaDto } from '../generated/models/CreateCapaDto.d.ts';
import type { UpdateCapaDto } from '../generated/models/UpdateCapaDto.d.ts';
import type { RejectVerificationDto } from '../generated/models/RejectVerificationDto.d.ts';
import type { StartAnalysisDto } from '../generated/models/StartAnalysisDto.d.ts';
import type { SubmitAnalysisDto } from '../generated/models/SubmitAnalysisDto.d.ts';
import type { SubmitCorrectionDto } from '../generated/models/SubmitCorrectionDto.d.ts';
import type { VerifyCapaDto } from '../generated/models/VerifyCapaDto.d.ts';
import type { CloseCapaDto } from '../generated/models/CloseCapaDto.d.ts';
import type { QualityInvestigation } from '../generated/models/QualityInvestigation.d.ts';
export type InvestigationStatus = 'open' | 'submitted' | 'in_analysis' | 'pending_verify' | 'closed' | 'cancelled';
export type InvestigationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type { QualityInvestigation } from '../generated/models/QualityInvestigation.d.ts';
interface CapaListParams {
    page?: number;
    pageSize?: number;
    status?: InvestigationStatus;
    severity?: InvestigationSeverity;
    keyword?: string;
    assigneeId?: string;
    inspectionId?: string;
}
export declare const capaService: {
    create: (dto: CreateCapaDto) => import("../../../types/generated/index").Promise<QualityInvestigation>;
    update: (dto: UpdateCapaDto) => import("../../../types/generated/index").Promise<QualityInvestigation>;
    startAnalysis: (dto: StartAnalysisDto) => import("../../../types/generated/index").Promise<QualityInvestigation>;
    submitCorrection: (dto: SubmitCorrectionDto) => import("../../../types/generated/index").Promise<QualityInvestigation>;
    submitAnalysis: (dto: SubmitAnalysisDto) => import("../../../types/generated/index").Promise<QualityInvestigation>;
    verify: (dto: VerifyCapaDto) => import("../../../types/generated/index").Promise<QualityInvestigation>;
    rejectVerification: (dto: RejectVerificationDto) => import("../../../types/generated/index").Promise<QualityInvestigation>;
    close: (dto: CloseCapaDto) => import("../../../types/generated/index").Promise<QualityInvestigation>;
    cancel: (dto: CancelCapaDto) => import("../../../types/generated/index").Promise<QualityInvestigation>;
    delete: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
    list(params?: CapaListParams): Promise<import("./_base.d.ts").PaginatedList<QualityInvestigation>>;
    detail(id: string): Promise<QualityInvestigation>;
};
