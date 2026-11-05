import { type PaginatedList } from './_base.d.ts';
export type PlanStatus = 'draft' | 'confirmed' | 'scheduled' | 'released' | 'in_progress' | 'completed' | 'closed' | 'cancelled';
export type { ProductionPlan } from '../generated/models/ProductionPlan.d.ts';
export type { ProductionPlanDetailDto } from '../generated/models/ProductionPlanDetailDto.d.ts';
export type { ProductionPlanListItemDto } from '../generated/models/ProductionPlanListItemDto.d.ts';
export type { ProductionPlanNetDemandPreviewDto } from '../generated/models/ProductionPlanNetDemandPreviewDto.d.ts';
export type { ProductionPlanNetDemandPreviewResponseDto } from '../generated/models/ProductionPlanNetDemandPreviewResponseDto.d.ts';
export type { CopyProductionPlanDto } from '../generated/models/CopyProductionPlanDto.d.ts';
import type { ProductionPlan } from '../generated/models/ProductionPlan.d.ts';
import type { ProductionPlanListItemDto } from '../generated/models/ProductionPlanListItemDto.d.ts';
import type { ProductionPlanDetailDto } from '../generated/models/ProductionPlanDetailDto.d.ts';
import type { ProductionPlanNetDemandPreviewDto } from '../generated/models/ProductionPlanNetDemandPreviewDto.d.ts';
import type { ProductionPlanNetDemandPreviewResponseDto } from '../generated/models/ProductionPlanNetDemandPreviewResponseDto.d.ts';
import type { CreateProductionPlanDto } from '../generated/models/CreateProductionPlanDto.d.ts';
import type { UpdateProductionPlanDto } from '../generated/models/UpdateProductionPlanDto.d.ts';
import type { CopyProductionPlanDto } from '../generated/models/CopyProductionPlanDto.d.ts';
import type { GetPlanWorkOrdersResponseDto } from '../generated/models/GetPlanWorkOrdersResponseDto.d.ts';
import type { ProductionPlanPrecheckResponseDto } from '../generated/models/ProductionPlanPrecheckResponseDto.d.ts';
type CreateProductionPlanInput = Omit<CreateProductionPlanDto, 'sourceDemandType' | 'stockNettingMode'> & {
    sourceDemandType?: unknown;
    stockNettingMode?: unknown;
};
type UpdateProductionPlanInput = Omit<UpdateProductionPlanDto, 'sourceDemandType' | 'stockNettingMode'> & {
    sourceDemandType?: unknown;
    stockNettingMode?: unknown;
};
type ProductionPlanNetDemandPreviewInput = Omit<ProductionPlanNetDemandPreviewDto, 'sourceDemandType' | 'stockScope'> & {
    sourceDemandType?: unknown;
    stockScope?: unknown;
};
export type { PlanWorkOrderItemDto } from '../generated/models/PlanWorkOrderItemDto.d.ts';
export type { GetPlanWorkOrdersResponseDto } from '../generated/models/GetPlanWorkOrdersResponseDto.d.ts';
export type { ProductionPlanPrecheckResponseDto } from '../generated/models/ProductionPlanPrecheckResponseDto.d.ts';
export type { ProductionPlanAchievementDto } from '../generated/models/ProductionPlanAchievementDto.d.ts';
export interface PlanListParams {
    page?: number;
    pageSize?: number;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
    status?: PlanStatus;
    statuses?: PlanStatus[];
    keyword?: string;
    materialId?: string;
    customerId?: string;
    sourceOrderNo?: string;
    priorityRange?: [number, number] | number[];
    saleOrderId?: string;
    saleOrderItemId?: string;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
}
export declare const productionPlanService: {
    list(params?: PlanListParams): Promise<PaginatedList<ProductionPlanListItemDto>>;
    detail(id: string): Promise<ProductionPlanDetailDto>;
    create: (dto: CreateProductionPlanInput) => Promise<ProductionPlan>;
    netDemandPreview: (dto: ProductionPlanNetDemandPreviewInput) => Promise<ProductionPlanNetDemandPreviewResponseDto>;
    update: (dto: UpdateProductionPlanInput) => Promise<ProductionPlan>;
    confirm(id: string, options?: {
        autoCreateWorkOrder?: boolean;
        routeId?: string;
        bomHeaderId?: string;
    }): Promise<ProductionPlan & {
        autoCreatedWorkOrderId?: string;
        autoCreatedWorkOrderNo?: string;
        autoCreatedSubAssemblyCount?: number;
    }>;
    unconfirm(id: string): Promise<void>;
    delete(id: string): Promise<void>;
    cancel(id: string, reason?: string): Promise<void>;
    reactivate(id: string): Promise<void>;
    close(id: string, remark?: string): Promise<void>;
    copy: (dto: CopyProductionPlanDto) => Promise<ProductionPlan>;
    /**
     * 获取生产计划关联的工单列表
     */
    getWorkOrders: (planId: string) => Promise<GetPlanWorkOrdersResponseDto>;
    /**
     * 下达前预检：返回 blockers / warnings / suggestions（只读，不阻断）。
     * 未随 OpenAPI 重生成，走通用 apiClient；调用方需自行降级处理失败。
     */
    precheck(id: string): Promise<ProductionPlanPrecheckResponseDto>;
};
