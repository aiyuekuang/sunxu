import type { PRSourceType } from './PRSourceType.d.ts';
import type { PRStatus } from './PRStatus.d.ts';
import type { PurchaseRequisitionItem } from './PurchaseRequisitionItem.d.ts';
import type { User } from './User.d.ts';
export type PurchaseRequisitionDetailDto = {
    approvedAt?: string | null;
    approvedBy?: User | null;
    approvedById?: string | null;
    /**
     * 当前可用业务动作
     */
    availableActions: Array<string>;
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
