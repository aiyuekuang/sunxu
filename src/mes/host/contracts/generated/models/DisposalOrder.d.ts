import type { DisposalStatus } from './DisposalStatus.d.ts';
import type { DisposalType } from './DisposalType.d.ts';
import type { QualityInspection } from './QualityInspection.d.ts';
import type { User } from './User.d.ts';
import type { WorkOrder } from './WorkOrder.d.ts';
export type DisposalOrder = {
    availableActions?: Array<string>;
    companyId: string;
    costAmount?: number | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    disposalNo: string;
    id: string;
    inspection?: QualityInspection;
    inspectionId: string;
    /**
     * 关联生产报废单ID
     */
    productionScrapOrderId?: string | null;
    qty: number;
    remarks?: string | null;
    reworkInspection?: QualityInspection | null;
    /**
     * IQC返工后的复检单ID
     */
    reworkInspectionId?: string | null;
    reworkWorkOrder?: WorkOrder | null;
    reworkWorkOrderId?: string | null;
    scrapTransactionId?: string | null;
    status: DisposalStatus;
    /**
     * 为空表示待判定，尚未确定具体处置方式
     */
    type?: DisposalType | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    workOrder?: WorkOrder | null;
    workOrderId?: string | null;
};
