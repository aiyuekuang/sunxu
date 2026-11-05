/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PRSourceType } from './PRSourceType';
import type { PRStatus } from './PRStatus';
import type { PurchaseRequisitionItem } from './PurchaseRequisitionItem';
import type { User } from './User';
export type PurchaseRequisition = {
    approvedAt?: string | null;
    approvedBy?: User | null;
    approvedById?: string | null;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 制单日期（YYYY-MM-DD；未指定时按创建当天取值）
     */
    documentDate: string;
    id: string;
    items?: Array<PurchaseRequisitionItem>;
    prNo: string;
    rejectReason?: string | null;
    remarks?: string | null;
    requestedBy?: User | null;
    requestedById?: string | null;
    sourceMrpRunId?: string | null;
    sourcePlanIds: Array<string>;
    sourceType: PRSourceType;
    status: PRStatus;
    submittedAt?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
