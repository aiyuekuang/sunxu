import type { QualityInspection } from './QualityInspection.d.ts';
import type { QualityInspectionRecordConclusion } from './QualityInspectionRecordConclusion.d.ts';
import type { QualityInspectionRecordItem } from './QualityInspectionRecordItem.d.ts';
import type { QualityInspectionRecordStatus } from './QualityInspectionRecordStatus.d.ts';
import type { QualityInspectionRecordType } from './QualityInspectionRecordType.d.ts';
import type { User } from './User.d.ts';
export type QualityInspectionRecord = {
    companyId: string;
    conclusion: QualityInspectionRecordConclusion;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    failQty: number;
    id: string;
    inspectedAt: string;
    inspection: QualityInspection;
    inspectionId: string;
    inspector?: User;
    inspectorId: string;
    items?: Array<QualityInspectionRecordItem>;
    operator?: User | null;
    /**
     * 本次过程检查对应的实际作业人（IPQC必填）
     */
    operatorId?: string | null;
    passQty: number;
    recheckOfRecord?: QualityInspectionRecord | null;
    /**
     * 复检来源检查记录ID；仅由不合格检查记录发起复检时填写
     */
    recheckOfRecordId?: string | null;
    /**
     * 检查方式。复检通过 recheckOfRecordId 关联原不合格检查记录，不再作为新建检查方式。
     */
    recordType: QualityInspectionRecordType;
    remarks?: string | null;
    sampleQty: number;
    /**
     * 质检单内顺序号
     */
    sequenceNo: number;
    status: QualityInspectionRecordStatus;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    voidReason?: string | null;
    voidedAt?: string | null;
    voidedBy?: string | null;
};
