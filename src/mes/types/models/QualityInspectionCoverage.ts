/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InspectionType } from './InspectionType';
import type { OutsourcingReceiptOrder } from './OutsourcingReceiptOrder';
import type { QualityInspection } from './QualityInspection';
import type { WorkOrderReportLog } from './WorkOrderReportLog';
export type QualityInspectionCoverage = {
    companyId: string;
    /**
     * 覆盖数量；IPQC为总报工量，FQC为良品产出量
     */
    coveredQty: number;
    createdAt: string;
    id: string;
    inspection?: QualityInspection;
    inspectionId: string;
    /**
     * 覆盖关系所属检验类型快照
     */
    inspectionType: InspectionType;
    /**
     * 是否为该报工流水当前有效的同类型质检覆盖归属
     */
    isActive: boolean;
    outsourcingReceiptOrder?: OutsourcingReceiptOrder | null;
    /**
     * 被本检验批覆盖的末道临时委外收货单ID
     */
    outsourcingReceiptOrderId?: string | null;
    reportLog?: WorkOrderReportLog | null;
    /**
     * 被本检验批覆盖的厂内报工流水ID
     */
    reportLogId?: string | null;
    /**
     * 已因报工冲正撤销的覆盖数量
     */
    revokedQty: number;
    updatedAt: string;
};
