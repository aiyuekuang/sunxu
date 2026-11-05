/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductionPlan } from './ProductionPlan';
import type { ProductionPlanReleaseLineStatus } from './ProductionPlanReleaseLineStatus';
import type { WorkOrder } from './WorkOrder';
export type ProductionPlanReleaseLineViewDto = {
    /**
     * 计划资源建议：负责人
     */
    assigneeId?: string | null;
    /**
     * 本批可覆盖计划表头的 BOM；默认继承计划
     */
    bomHeaderId?: string | null;
    /**
     * 取消/关闭原因
     */
    closeReason?: string | null;
    companyId: string;
    createdAt: string;
    dueDate?: string | null;
    /**
     * 计划资源建议：设备
     */
    equipmentId?: string | null;
    id: string;
    /**
     * 批次行号
     */
    lineNo: number;
    lockedAt?: string | null;
    plan?: ProductionPlan;
    planEndTime?: string | null;
    planId: string;
    planStartTime?: string | null;
    /**
     * 本批投产数量
     */
    plannedQty: number;
    /**
     * 计划资源建议：产线
     */
    productionLineId?: string | null;
    /**
     * 下达批次号，如 PP-xxx-01
     */
    releaseNo: string;
    releasedAt?: string | null;
    releasedBy?: string | null;
    /**
     * 本批对应良品需求数量
     */
    requiredQty: number;
    /**
     * 本批可覆盖计划表头的工艺路线；默认继承计划
     */
    routeId?: string | null;
    /**
     * 排产摘要缓存
     */
    scheduleSummary?: Record<string, any> | null;
    status: ProductionPlanReleaseLineStatus;
    /**
     * 批次状态中文
     */
    statusLabel?: string;
    updatedAt: string;
    /**
     * 计划资源建议：工作中心
     */
    workCenterId?: string | null;
    workOrder?: WorkOrder | null;
    /**
     * 下达后生成的主工单ID
     */
    workOrderId?: string | null;
};
