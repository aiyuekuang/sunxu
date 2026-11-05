import type { DisposalOrder } from './DisposalOrder.d.ts';
import type { QualityInspection } from './QualityInspection.d.ts';
import type { QualityReleaseType } from './QualityReleaseType.d.ts';
import type { User } from './User.d.ts';
export type QualityRelease = {
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    disposal?: DisposalOrder | null;
    disposalId?: string | null;
    id: string;
    inspection?: QualityInspection;
    inspectionId: string;
    quantity: number;
    releaseType: QualityReleaseType;
    /**
     * 幂等来源键
     */
    sourceKey: string;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
