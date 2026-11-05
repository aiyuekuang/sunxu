import type { Equipment } from './Equipment.d.ts';
import type { EquipmentInspection } from './EquipmentInspection.d.ts';
import type { FaultStatus } from './FaultStatus.d.ts';
import type { User } from './User.d.ts';
export type EquipmentFault = {
    assignee?: User | null;
    assigneeId?: string | null;
    /**
     * 故障现场照片或来源点检证据
     */
    attachments?: Array<string> | null;
    /**
     * 当前故障单允许的业务动作
     */
    availableActions?: Array<string>;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    downtimeEnd?: string | null;
    downtimeMinutes?: number | null;
    downtimeStart?: string | null;
    equipment?: Equipment;
    equipmentId: string;
    faultCategory?: string | null;
    faultDescription: string;
    faultNo: string;
    id: string;
    isDowntime: boolean;
    remarks?: string | null;
    repairAction?: string | null;
    repairCompletedAt?: string | null;
    repairCost?: number | null;
    repairStartedAt?: string | null;
    reportedBy?: string | null;
    reporter?: User | null;
    rootCause?: string | null;
    severity: string;
    sourceInspection?: EquipmentInspection | null;
    /**
     * 来源点检记录ID
     */
    sourceInspectionId?: string | null;
    status: FaultStatus;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    verificationResult?: string | null;
    /**
     * 验收时间
     */
    verifiedAt?: string | null;
    /**
     * 验收人
     */
    verifiedBy?: string | null;
    verifier?: User | null;
};
