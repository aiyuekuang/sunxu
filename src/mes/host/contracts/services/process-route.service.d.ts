import { type PaginatedList } from './_base.d.ts';
import type { CreateProcessRouteDto } from '../generated/models/CreateProcessRouteDto.d.ts';
import type { UpdateProcessRouteDto } from '../generated/models/UpdateProcessRouteDto.d.ts';
import type { AddOperationDto } from '../generated/models/AddOperationDto.d.ts';
import type { UpdateRouteOperationDto } from '../generated/models/UpdateRouteOperationDto.d.ts';
import type { UpdateRouteTopologyDto } from '../generated/models/UpdateRouteTopologyDto.d.ts';
import type { CopyProcessRouteAsNewDto } from '../generated/models/CopyProcessRouteAsNewDto.d.ts';
import type { CopyProcessRouteDto } from '../generated/models/CopyProcessRouteDto.d.ts';
import type { ActivateProcessRouteDto } from '../generated/models/ActivateProcessRouteDto.d.ts';
import type { ProcessRouteActivationPrecheckResponseDto } from '../generated/models/ProcessRouteActivationPrecheckResponseDto.d.ts';
import type { ProcessRouteVersion } from '../generated/models/ProcessRouteVersion.d.ts';
import type { ProcessRouteVersionListDto } from '../generated/models/ProcessRouteVersionListDto.d.ts';
import type { ResolveProcessRouteVersionDto } from '../generated/models/ResolveProcessRouteVersionDto.d.ts';
import type { ProcessRouteApplicability } from '../generated/models/ProcessRouteApplicability.d.ts';
import type { ProcessRouteApplicabilityListDto } from '../generated/models/ProcessRouteApplicabilityListDto.d.ts';
import type { SaveProcessRouteApplicabilityDto } from '../generated/models/SaveProcessRouteApplicabilityDto.d.ts';
export type RouteStatus = 'draft' | 'active' | 'obsolete';
export type { ProcessOperation } from '../generated/models/ProcessOperation.d.ts';
export type { ProcessRoute } from '../generated/models/ProcessRoute.d.ts';
export type { ProcessRouteVersion } from '../generated/models/ProcessRouteVersion.d.ts';
export type { ProcessRouteApplicability } from '../generated/models/ProcessRouteApplicability.d.ts';
export type { CopyProcessRouteDto } from '../generated/models/CopyProcessRouteDto.d.ts';
export type { CopyProcessRouteAsNewDto } from '../generated/models/CopyProcessRouteAsNewDto.d.ts';
export type { ProcessRouteActivationPrecheckResponseDto } from '../generated/models/ProcessRouteActivationPrecheckResponseDto.d.ts';
import type { ProcessRoute } from '../generated/models/ProcessRoute.d.ts';
interface RouteListParams {
    page?: number;
    pageSize?: number;
    status?: RouteStatus;
    materialId?: string;
    familyId?: string;
    keyword?: string;
}
interface EffectiveRouteListParams extends RouteListParams {
    routeSelectionDate?: string;
}
export declare const processRouteService: {
    create: (dto: CreateProcessRouteDto) => import("../../../types/generated/index").Promise<ProcessRoute>;
    update: (dto: UpdateProcessRouteDto) => import("../../../types/generated/index").Promise<ProcessRoute>;
    addOperation: (dto: AddOperationDto) => import("../../../types/generated/index").Promise<import("./process-route.service.d.ts").ProcessOperation>;
    updateOperation: (dto: UpdateRouteOperationDto) => import("../../../types/generated/index").Promise<import("./process-route.service.d.ts").ProcessOperation>;
    saveTopology: (dto: UpdateRouteTopologyDto) => import("../../../types/generated/index").Promise<ProcessRoute>;
    removeOperation(id: string): Promise<void>;
    reorderOperation: (id: string, direction: "up" | "down") => Promise<any>;
    delete: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
    copy: (dto: CopyProcessRouteDto) => import("../../../types/generated/index").Promise<ProcessRoute>;
    copyAsNew: (dto: CopyProcessRouteAsNewDto) => import("../../../types/generated/index").Promise<ProcessRoute>;
    activate: (id: string, options?: Omit<ActivateProcessRouteDto, "id">) => import("../../../types/generated/index").Promise<ProcessRoute>;
    activationPrecheck: (id: string) => import("../../../types/generated/index").Promise<ProcessRouteActivationPrecheckResponseDto>;
    deactivate: (id: string) => import("../../../types/generated/index").Promise<ProcessRoute>;
    versions: (params: ProcessRouteVersionListDto) => Promise<{
        list: ProcessRouteVersion[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    resolveVersion: (params: ResolveProcessRouteVersionDto) => import("../../../types/generated/index").Promise<ProcessRouteVersion>;
    listEffective(params: EffectiveRouteListParams): Promise<PaginatedList<ProcessRoute>>;
    applicabilities: (params: ProcessRouteApplicabilityListDto) => Promise<{
        list: ProcessRouteApplicability[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    saveApplicability: (dto: SaveProcessRouteApplicabilityDto) => import("../../../types/generated/index").Promise<ProcessRouteApplicability>;
    deleteApplicability: (id: string) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").SuccessResponseDto>;
    list(params?: RouteListParams): Promise<PaginatedList<ProcessRoute>>;
    detail(id: string): Promise<ProcessRoute>;
};
