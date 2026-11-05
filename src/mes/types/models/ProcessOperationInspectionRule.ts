/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Material } from './Material';
import type { ProcessRouteApplicability } from './ProcessRouteApplicability';
import type { QualityTemplate } from './QualityTemplate';
export type ProcessOperationInspectionRule = {
    companyId: string;
    createdAt: string;
    id: string;
    /**
     * 适配物料
     */
    material?: Material | null;
    /**
     * 适配物料ID；为空表示默认 IPQC 模板
     */
    materialId?: string | null;
    /**
     * 所属工艺路线工序
     */
    processOperation?: Record<string, any>;
    /**
     * 工艺路线工序ID
     */
    processOperationId: string;
    /**
     * 路线适用规则
     */
    routeApplicability?: ProcessRouteApplicability | null;
    /**
     * 历史路线适用规则ID；仅兼容存量条件模板，新增规则不再写入
     */
    routeApplicabilityId?: string | null;
    /**
     * IPQC质检模板
     */
    template?: QualityTemplate;
    /**
     * IPQC质检模板ID
     */
    templateId: string;
    updatedAt: string;
};
