import type { CheckMaterialReadinessDto } from '../generated/models/CheckMaterialReadinessDto.d.ts';
import type { MaterialIssueListDto } from '../generated/models/MaterialIssueListDto.d.ts';
import type { ManualIssueDto } from '../generated/models/ManualIssueDto.d.ts';
import type { CompleteMaterialIssueDto } from '../generated/models/CompleteMaterialIssueDto.d.ts';
import type { ReverseMaterialIssueDto } from '../generated/models/ReverseMaterialIssueDto.d.ts';
import type { ReverseAuditDto } from '../generated/models/ReverseAuditDto.d.ts';
export type MaterialReqStatus = 'pending' | 'partial' | 'fulfilled' | 'closed';
export type MaterialIssueType = 'auto_issue' | 'manual_issue' | 'return';
export type MaterialIssueStatus = 'draft' | 'submitted' | 'confirmed' | 'completed' | 'reversed' | 'cancelled';
export type { WorkOrderMaterialReq as MaterialReq } from '../generated/models/WorkOrderMaterialReq.d.ts';
export type { MaterialIssueOrder } from '../generated/models/MaterialIssueOrder.d.ts';
export type { MaterialIssueItem } from '../generated/models/MaterialIssueItem.d.ts';
export type { CheckMaterialReadinessResponseDto as MaterialReadiness } from '../generated/models/CheckMaterialReadinessResponseDto.d.ts';
import type { WorkOrderMaterialReq as MaterialReq } from '../generated/models/WorkOrderMaterialReq.d.ts';
import type { MaterialIssueOrder } from '../generated/models/MaterialIssueOrder.d.ts';
import type { CheckMaterialReadinessResponseDto as MaterialReadiness } from '../generated/models/CheckMaterialReadinessResponseDto.d.ts';
export type MaterialIssueListParams = Omit<MaterialIssueListDto, 'status' | 'type'> & {
    status?: MaterialIssueStatus;
    type?: MaterialIssueType;
};
export declare const materialIssueService: {
    expandBom: (workOrderId: string) => import("../../../types/generated/index").Promise<MaterialReq[]>;
    getMaterialReqs: (workOrderId: string) => Promise<MaterialReq[]>;
    checkReadiness: (workOrderId: string, scope?: CheckMaterialReadinessDto["scope"], operationId?: string) => Promise<MaterialReadiness>;
    list(params?: MaterialIssueListParams): Promise<{
        list: MaterialIssueOrder[];
        total: number;
    }>;
    detail: (id: string) => Promise<MaterialIssueOrder>;
    manualIssue: (dto: ManualIssueDto) => Promise<MaterialIssueOrder>;
    completeIssue: (dto: CompleteMaterialIssueDto) => Promise<MaterialIssueOrder>;
    cancelIssue: (id: string) => Promise<MaterialIssueOrder>;
    reverseIssue: (dto: ReverseMaterialIssueDto) => Promise<MaterialIssueOrder>;
    reverseAuditIssue: (dto: ReverseAuditDto) => Promise<MaterialIssueOrder>;
};
