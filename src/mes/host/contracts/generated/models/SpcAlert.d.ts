import type { Material } from './Material.d.ts';
import type { QualityInspection } from './QualityInspection.d.ts';
import type { QualityInvestigation } from './QualityInvestigation.d.ts';
import type { SpcAlertSeverity } from './SpcAlertSeverity.d.ts';
import type { SpcAlertStatus } from './SpcAlertStatus.d.ts';
import type { SpcAlertType } from './SpcAlertType.d.ts';
import type { SpcRecord } from './SpcRecord.d.ts';
import type { User } from './User.d.ts';
export type SpcAlert = {
    alertNo: string;
    alertType: SpcAlertType;
    /**
     * 异常类型中文
     */
    alertTypeLabel?: string;
    assignee?: User | null;
    assigneeId?: string | null;
    /**
     * 当前状态允许的业务操作
     */
    availableActions?: Array<string>;
    cancelReason?: string | null;
    capa?: QualityInvestigation | null;
    capaId?: string | null;
    characteristicName: string;
    closeEvidence?: string | null;
    closedAt?: string | null;
    closedBy?: string | null;
    closer?: User | null;
    companyId: string;
    controlCl?: number | null;
    controlLcl?: number | null;
    controlUcl?: number | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    handleResult?: string | null;
    handledAt?: string | null;
    handledBy?: string | null;
    handler?: User | null;
    id: string;
    inspection?: QualityInspection | null;
    inspectionId?: string | null;
    lowerSpec?: number | null;
    material?: Material;
    materialId: string;
    measuredValue?: number | null;
    remarks?: string | null;
    sampleGroup?: number | null;
    severity: SpcAlertSeverity;
    /**
     * 严重程度中文
     */
    severityLabel?: string;
    spcRecord?: SpcRecord | null;
    spcRecordId?: string | null;
    status: SpcAlertStatus;
    /**
     * 状态颜色
     */
    statusColor?: string;
    /**
     * 状态中文
     */
    statusLabel?: string;
    triggerMessage: string;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    upperSpec?: number | null;
};
